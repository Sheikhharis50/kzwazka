import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';
import { DatabaseService } from '../db/drizzle.service';
import { Children } from '../db/schemas';
import { APIResponse } from 'src/utils/response';
import { GroupService } from '../group/group.service';
import { ChildrenService } from '../children/children.service';
import { ChildrenInvoiceService } from '../children/children-invoice.service';
import { ChildrenInvoiceStatus } from '../utils/constants';
import { SubscribeToGroupDto } from './dto/create-payment.dto';

export interface WebhookResult {
  handled: boolean;
  reason?: string;
  error?: string;
  data?: any;
}

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly dbService: DatabaseService,
    private readonly groupService: GroupService,
    @Inject(forwardRef(() => ChildrenService))
    private readonly childrenService: ChildrenService,
    @Inject(forwardRef(() => ChildrenInvoiceService))
    private readonly childrenInvoiceService: ChildrenInvoiceService
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY')!);
  }

  // CUSTOMER MANAGEMENT
  async createCustomer(
    email: string,
    name?: string,
    phone?: string,
    metadata?: Record<string, string>
  ) {
    const customer = await this.stripe.customers.create({
      email,
      name,
      phone,
      metadata,
    });

    this.logger.log(`Created Stripe customer: ${customer.id} for ${email}`);
    return customer;
  }

  // CHECKOUT SESSION FLOW
  async createCheckoutSession(
    customerId: string,
    productId: string,
    successUrl: string,
    cancelUrl: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Checkout.Session> {
    const product = await this.stripe.products.retrieve(productId);

    if (!product.default_price) {
      throw new Error('Product does not have a default price');
    }

    const price =
      typeof product.default_price === 'string'
        ? product.default_price
        : product.default_price.id;

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        product_id: productId,
        customer_id: customerId,
        ...metadata,
      },
    });

    this.logger.log(
      `Created checkout session: ${session.id} for customer: ${customerId}`
    );
    return session;
  }

  // SIMPLIFIED WEBHOOK PROCESSING
  async processWebhookEvent(event: Stripe.Event): Promise<WebhookResult> {
    try {
      this.logger.log(`Processing webhook event: ${event.type} - ${event.id}`);

      switch (event.type) {
        // Focus on checkout session events only
        case 'checkout.session.completed':
          return await this.handleCheckoutCompleted(event);

        case 'checkout.session.expired':
          return this.handleCheckoutExpired(event);

        // Handle subscription lifecycle for ongoing billing
        case 'invoice.payment_succeeded':
          return await this.handlePaymentSucceeded(event);

        case 'invoice.payment_failed':
          return await this.handlePaymentFailed(event);

        case 'customer.subscription.deleted':
          return await this.handleSubscriptionCanceled(event);

        // Log but don't process other events
        default:
          this.logger.log(`Event ${event.type} logged but not processed`);
          return { handled: true, reason: 'Event logged only' };
      }
    } catch (error) {
      this.logger.error(
        `Error processing webhook event ${event.type}: ${(error as Error).message}`
      );
      return {
        handled: false,
        error: (error as Error).message,
        reason: 'Processing error',
      };
    }
  }

  // CHECKOUT SESSION COMPLETED - Main success flow
  private async handleCheckoutCompleted(
    event: Stripe.Event
  ): Promise<WebhookResult> {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const childrenId = parseInt(session.metadata?.children_id || '0');
      const groupId = parseInt(session.metadata?.group_id || '0');

      if (!childrenId || !groupId) {
        return {
          handled: false,
          reason: 'Missing children_id or group_id in metadata',
        };
      }

      // Create invoice record
      await this.createInvoiceRecord({
        children_id: childrenId,
        group_id: groupId,
        external_id: session.invoice as string,
        amount: session.amount_total || 0,
        status: ChildrenInvoiceStatus.PAID,
        metadata: { checkout_completed: JSON.stringify(session) },
      });

      // Assign child to group
      await this.assignChildToGroup(childrenId, groupId);

      this.logger.log(
        `Checkout completed: Child ${childrenId} assigned to group ${groupId}`
      );

      return {
        handled: true,
        data: {
          children_id: childrenId,
          group_id: groupId,
          session_id: session.id,
        },
      };
    } catch (error) {
      return {
        handled: false,
        error: (error as Error).message,
        reason: 'Error processing checkout completion',
      };
    }
  }

  // CHECKOUT SESSION EXPIRED
  private handleCheckoutExpired(event: Stripe.Event): WebhookResult {
    const session = event.data.object as Stripe.Checkout.Session;

    this.logger.log(`Checkout session expired: ${session.id}`);

    return {
      handled: true,
      reason: 'Checkout session expired - no action needed',
    };
  }

  // RECURRING PAYMENT SUCCEEDED
  private async handlePaymentSucceeded(
    event: Stripe.Event
  ): Promise<WebhookResult> {
    const invoice = event.data.object as Stripe.Invoice;

    try {
      const customerId = invoice.customer as string;
      const children = await this.findChildrenByCustomerId(customerId);

      if (!children) {
        return {
          handled: false,
          reason: `Children not found for customer: ${customerId}`,
        };
      }

      // Update invoice record
      await this.updateInvoiceRecord({
        external_id: invoice.id,
        children_id: children.id,
        status: ChildrenInvoiceStatus.PAID,
        amount: invoice.amount_paid || 0,
        metadata: { payment_succeeded: JSON.stringify(invoice) },
      });

      // Ensure child is still in group (in case they were removed)
      if (children.group_id) {
        await this.assignChildToGroup(children.id, children.group_id);
      }

      return {
        handled: true,
        data: { children_id: children.id, invoice_id: invoice.id },
      };
    } catch (error) {
      return {
        handled: false,
        error: (error as Error).message,
        reason: 'Error processing payment success',
      };
    }
  }

  // PAYMENT FAILED
  private async handlePaymentFailed(
    event: Stripe.Event
  ): Promise<WebhookResult> {
    const invoice = event.data.object as Stripe.Invoice;

    try {
      const customerId = invoice.customer as string;
      const children = await this.findChildrenByCustomerId(customerId);

      if (!children) {
        return {
          handled: false,
          reason: `Children not found for customer: ${customerId}`,
        };
      }

      // Update invoice record
      await this.updateInvoiceRecord({
        external_id: invoice.id,
        children_id: children.id,
        status: ChildrenInvoiceStatus.FAILED,
        amount: invoice.amount_due || 0,
        metadata: { payment_failed: JSON.stringify(invoice) },
      });

      // Don't remove from group immediately - give them a chance to update payment
      this.logger.log(
        `Payment failed for child ${children.id} - keeping in group for now`
      );

      return {
        handled: true,
        data: {
          children_id: children.id,
          invoice_id: invoice.id,
          status: 'payment_failed',
        },
      };
    } catch (error) {
      return {
        handled: false,
        error: (error as Error).message,
        reason: 'Error processing payment failure',
      };
    }
  }

  // SUBSCRIPTION CANCELED
  private async handleSubscriptionCanceled(
    event: Stripe.Event
  ): Promise<WebhookResult> {
    const subscription = event.data.object as Stripe.Subscription;

    try {
      const customerId = subscription.customer as string;
      const children = await this.findChildrenByCustomerId(customerId);

      if (!children) {
        return {
          handled: false,
          reason: `Children not found for customer: ${customerId}`,
        };
      }

      // Remove child from group
      await this.removeChildFromGroup(children.id);

      // Update any pending invoices
      await this.updateInvoiceRecord({
        children_id: children.id,
        status: ChildrenInvoiceStatus.CANCELED,
        metadata: { subscription_canceled: JSON.stringify(subscription) },
      });

      this.logger.log(
        `Subscription canceled: Child ${children.id} removed from group`
      );

      return {
        handled: true,
        data: {
          children_id: children.id,
          subscription_id: subscription.id,
          status: 'canceled',
        },
      };
    } catch (error) {
      return {
        handled: false,
        error: (error as Error).message,
        reason: 'Error processing subscription cancellation',
      };
    }
  }

  // CUSTOMER PORTAL
  async createCustomerPortalSession(
    user_id: number,
    return_url: string
  ): Promise<APIResponse<string | undefined>> {
    try {
      const children = await this.childrenService.findByUserId(user_id);
      if (!children || children.length === 0) {
        return APIResponse.error<undefined>({
          message: 'Children not found',
          statusCode: 404,
        });
      }

      const customer_id = children[0].external_id;
      if (!customer_id) {
        return APIResponse.error<undefined>({
          message: 'Children does not have a Stripe customer ID',
          statusCode: 400,
        });
      }
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customer_id,
        return_url: return_url,
      });

      return APIResponse.success<string>({
        message: 'Customer portal session created successfully',
        data: session.url,
        statusCode: 200,
      });
    } catch (error) {
      return APIResponse.error<undefined>({
        message: `Failed to create customer portal session: ${(error as Error).message}`,
        statusCode: 500,
      });
    }
  }

  // MAIN SUBSCRIPTION FLOW
  async subscribeToGroup(
    body: SubscribeToGroupDto,
    user_id: number
  ): Promise<APIResponse<string | undefined>> {
    try {
      // Get child data
      const children = await this.childrenService.findByUserId(user_id);
      if (!children || children.length === 0) {
        return APIResponse.error<undefined>({
          message: 'Children not found',
          statusCode: 404,
        });
      }

      // Get group data
      const group = await this.groupService.findOne(body.group_id);
      if (!group.data) {
        return APIResponse.error<undefined>({
          message: 'Group not found',
          statusCode: 404,
        });
      }

      const hasSpace = await this.groupService.validateGroupHasSpace(
        body.group_id
      );
      if (!hasSpace) {
        return APIResponse.error<undefined>({
          message: 'Group capacity is full',
          statusCode: 400,
        });
      }

      const child = children[0];

      // Ensure child has external_id (Stripe customer)
      if (!child.external_id) {
        return APIResponse.error<undefined>({
          message: 'Child does not have a Stripe customer ID',
          statusCode: 400,
        });
      }

      // Ensure group has external_id (Stripe product)
      if (!group.data.external_id) {
        return APIResponse.error<undefined>({
          message: 'Group does not have a Stripe product ID',
          statusCode: 400,
        });
      }

      // Create checkout session
      const session = await this.createCheckoutSession(
        child.external_id,
        group.data.external_id,
        body.success_url,
        body.cancel_url,
        {
          children_id: child.id.toString(),
          group_id: group.data.id.toString(),
        }
      );

      return APIResponse.success<string>({
        message: 'Checkout session created successfully',
        data: session.url || '',
        statusCode: 200,
      });
    } catch (error) {
      return APIResponse.error<undefined>({
        message: `Failed to create subscription: ${(error as Error).message}`,
        statusCode: 500,
      });
    }
  }

  // HELPER METHODS
  private async findChildrenByCustomerId(
    customerId: string
  ): Promise<Children | null> {
    try {
      const result =
        await this.childrenService.getChildrenByExternalId(customerId);
      return result.data || null;
    } catch (error) {
      this.logger.error(
        `Error finding children by customer ID ${customerId}: ${(error as Error).message}`
      );
      return null;
    }
  }

  private async createInvoiceRecord(data: {
    children_id: number;
    group_id: number;
    external_id: string;
    amount: number;
    status: ChildrenInvoiceStatus;
    metadata: Record<string, any>;
  }): Promise<void> {
    try {
      await this.childrenInvoiceService.createChildrenInvoice({
        children_id: data.children_id,
        group_id: data.group_id,
        external_id: data.external_id,
        amount: data.amount,
        status: data.status,
        metadata: data.metadata,
        external_url: '',
      });

      this.logger.log(`Created invoice record: ${data.external_id}`);
    } catch (error) {
      this.logger.error(
        `Error creating invoice record: ${(error as Error).message}`
      );
      throw error;
    }
  }

  private async updateInvoiceRecord(data: {
    external_id?: string;
    children_id?: number;
    status?: ChildrenInvoiceStatus;
    amount?: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      if (data.external_id) {
        // Find by external_id first
        const existingInvoice =
          await this.childrenInvoiceService.findOneByExternalId(
            data.external_id
          );

        if (existingInvoice.data) {
          await this.childrenInvoiceService.update(existingInvoice.data.id, {
            ...(data.status && { status: data.status }),
            ...(data.amount && { amount: data.amount }),
            ...(data.metadata && {
              metadata: {
                ...(existingInvoice.data.metadata as Record<string, string>),
                ...(data.metadata as Record<string, string>),
              },
            }),
          });

          this.logger.log(`Updated invoice record: ${data.external_id}`);
        }
      }
    } catch (error) {
      this.logger.error(
        `Error updating invoice record: ${(error as Error).message}`
      );
      // Don't throw - this shouldn't stop the main flow
    }
  }

  private async assignChildToGroup(
    childrenId: number,
    groupId: number
  ): Promise<void> {
    try {
      await this.childrenService.update(childrenId, { group_id: groupId });
      this.logger.log(`Assigned child ${childrenId} to group ${groupId}`);
    } catch (error) {
      this.logger.error(
        `Error assigning child to group: ${(error as Error).message}`
      );
      throw error;
    }
  }

  private async removeChildFromGroup(childrenId: number): Promise<void> {
    try {
      await this.childrenService.update(childrenId, { group_id: null });
      this.logger.log(`Removed child ${childrenId} from group`);
    } catch (error) {
      this.logger.error(
        `Error removing child from group: ${(error as Error).message}`
      );
      // Don't throw - this shouldn't stop the main flow
    }
  }
}
