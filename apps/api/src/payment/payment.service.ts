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
import { IChildrenResponse } from 'src/children/children.types';

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

  async createSubscription(customerId: string, productId: string) {
    const product = await this.stripe.products.retrieve(productId);
    let price: string;

    if (product.default_price) {
      if (typeof product.default_price === 'string') {
        price = product.default_price;
      } else {
        price = product.default_price.id;
      }

      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: price, quantity: 1 }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          product_id: productId,
          customer_id: customerId,
        },
      });

      this.logger.log(
        `Created subscription: ${subscription.id} for customer: ${customerId}`
      );
      return subscription;
    }

    throw new Error('Product does not have a default price');
  }

  verifyWebhookEvent(body: any, signature: string): Stripe.Event | null {
    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        this.configService.get('STRIPE_WEBHOOK_SECRET')!
      );
      return event;
    } catch (error) {
      this.logger.error(
        `Webhook verification failed: ${(error as Error).message}`
      );
      return null;
    }
  }

  async processWebhookEvent(event: Stripe.Event): Promise<WebhookResult> {
    try {
      this.logger.log(`Processing webhook event: ${event.type} - ${event.id}`);

      switch (event.type) {
        case 'customer.created':
        case 'customer.updated':
          return this.handleCustomerEvent(event);
        case 'customer.subscription.created':
          return await this.handleSubscriptionCreated(event);
        case 'customer.subscription.updated':
          return await this.handleSubscriptionUpdated(event);
        case 'customer.subscription.deleted':
          return await this.handleSubscriptionDeleted(event);
        case 'customer.subscription.paused':
        case 'customer.subscription.resumed':
          return await this.handleSubscriptionPausedResumed(event);
        case 'invoice.created':
        case 'invoice.finalized':
          return await this.handleInvoiceCreatedOrFinalized(event);
        case 'invoice.paid':
        case 'invoice.payment_succeeded':
          return await this.handleInvoicePaid(event);
        case 'invoice.payment_failed':
        case 'invoice.payment_action_required':
          return await this.handleInvoicePaymentFailed(event);
        case 'invoice.finalization_failed':
          return await this.handleInvoiceFinalizationFailed(event);
        case 'invoice.updated':
        case 'invoice_payment.paid':
          return await this.handleInvoiceUpdated(event);
        case 'payment_intent.created':
        case 'payment_intent.succeeded':
        case 'payment_method.attached':
        case 'charge.succeeded':
          // These events don't require specific handling for our business logic
          return {
            handled: true,
            reason: 'Event logged but no action required',
          };
        default:
          this.logger.warn(`Unhandled event type: ${event.type}`);
          return {
            handled: false,
            reason: `Unhandled event type: ${event.type}`,
          };
      }
    } catch (error) {
      this.logger.error(
        `Error processing webhook event ${event.type}: ${(error as Error).message}`,
        (error as Error).stack
      );
      return {
        handled: false,
        error: (error as Error).message,
        reason: 'Processing error',
      };
    }
  }

  // Helper methods
  private async findChildrenByCustomerId(
    customerId: string
  ): Promise<Children | null> {
    if (!customerId) {
      this.logger.warn('Customer ID is missing');
      return null;
    }

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

  private async upsertInvoiceRecord(invoiceData: {
    children_id: number;
    external_id?: string;
    amount: number;
    status: ChildrenInvoiceStatus;
    group_id?: number;
    metadata?: Record<string, any>;
  }): Promise<boolean> {
    try {
      // First, try to find existing invoice
      const existingInvoiceResponse =
        await this.childrenInvoiceService.findOneByExternalId(
          invoiceData.external_id || ''
        );

      if (
        existingInvoiceResponse.data &&
        existingInvoiceResponse.statusCode === 200
      ) {
        // Update existing invoice
        const updateData = {
          status: invoiceData.status,
          amount: invoiceData.amount,
          ...(invoiceData.group_id && { group_id: invoiceData.group_id }),
          metadata: {
            ...((existingInvoiceResponse.data.metadata as Record<
              string,
              any
            >) || {}),
            ...(invoiceData.metadata || {}),
          },
        };

        const updateResult = await this.childrenInvoiceService.update(
          existingInvoiceResponse.data.id,
          updateData
        );

        if (updateResult.statusCode === 200) {
          this.logger.log(`Updated invoice: ${invoiceData.external_id}`);
          return true;
        } else {
          this.logger.error(
            `Failed to update invoice: ${updateResult.message}`
          );
          return false;
        }
      } else {
        // Create new invoice - get group_id from children if not provided
        let groupId = invoiceData.group_id;
        if (!groupId) {
          const children = await this.childrenService.findOne(
            invoiceData.children_id
          );
          groupId = children.data?.group?.id || 0;
        }

        const createData = {
          children_id: invoiceData.children_id,
          group_id: groupId || 0,
          external_id: invoiceData.external_id || '',
          amount: invoiceData.amount,
          status: invoiceData.status,
          metadata: invoiceData.metadata || {},
        };

        const createResult =
          await this.childrenInvoiceService.createChildrenInvoice(createData);

        if (createResult.statusCode === 201) {
          this.logger.log(`Created invoice: ${invoiceData.external_id}`);
          return true;
        } else {
          this.logger.error(
            `Failed to create invoice: ${createResult.message}`
          );
          return false;
        }
      }
    } catch (error) {
      this.logger.error(`Error upserting invoice: ${(error as Error).message}`);
      return false;
    }
  }

  private async updateChildrenGroupStatus(
    childrenId: number,
    groupId: number | null,
    reason: string
  ): Promise<void> {
    try {
      await this.childrenService.update(childrenId, { group_id: groupId });
      this.logger.log(
        `${reason}: Updated children ${childrenId} group to ${groupId}`
      );
    } catch (error) {
      this.logger.error(
        `Error updating children group: ${(error as Error).message}`
      );
    }
  }

  private extractSubscriptionAmount(subscription: Stripe.Subscription): number {
    try {
      return subscription.items.data[0]?.price?.unit_amount || 0;
    } catch (error) {
      this.logger.error(
        `Error extracting subscription amount: ${(error as Error).message}`
      );
      return 0;
    }
  }

  private extractInvoiceId(subscription: Stripe.Subscription): string | null {
    const invoiceId = subscription.latest_invoice;
    if (typeof invoiceId === 'string') {
      return invoiceId;
    }
    if (invoiceId && typeof invoiceId === 'object' && 'id' in invoiceId) {
      return invoiceId.id || null;
    }
    return null;
  }

  // Webhook handlers
  private handleCustomerEvent(event: Stripe.Event): WebhookResult {
    const customer = event.data.object as Stripe.Customer;
    this.logger.log(
      `Customer ${event.type}: ${customer.id} - ${customer.email || 'N/A'}`
    );
    return {
      handled: true,
      data: { customer_id: customer.id, email: customer.email },
    };
  }

  private async handleSubscriptionCreated(
    event: Stripe.Event
  ): Promise<WebhookResult> {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    try {
      const children = await this.findChildrenByCustomerId(customerId);
      if (!children) {
        return {
          handled: false,
          reason: `Children not found for customer: ${customerId}`,
        };
      }

      const invoiceId = this.extractInvoiceId(subscription);
      if (!invoiceId) {
        return {
          handled: false,
          reason: 'No invoice ID found in subscription',
        };
      }

      // Create invoice record regardless of group assignment
      const success = await this.upsertInvoiceRecord({
        children_id: children.id,
        external_id: invoiceId,
        amount: this.extractSubscriptionAmount(subscription),
        status: ChildrenInvoiceStatus.PENDING,
        group_id: children.group_id || undefined,
        metadata: { subscription_created: JSON.stringify(subscription) },
      });

      return {
        handled: success,
        data: { children_id: children.id, subscription_id: subscription.id },
        reason: success ? undefined : 'Failed to create invoice record',
      };
    } catch (error) {
      return {
        handled: false,
        error: (error as Error).message,
        reason: 'Error processing subscription creation',
      };
    }
  }

  private async handleSubscriptionUpdated(
    event: Stripe.Event
  ): Promise<WebhookResult> {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    try {
      const children = await this.findChildrenByCustomerId(customerId);
      if (!children) {
        return {
          handled: false,
          reason: `Children not found for customer: ${customerId}`,
        };
      }

      const invoiceId = this.extractInvoiceId(subscription);
      let invoiceStatus = ChildrenInvoiceStatus.PENDING;
      let shouldAssignGroup = false;

      // Determine status based on subscription status
      switch (subscription.status) {
        case 'active':
          invoiceStatus = ChildrenInvoiceStatus.PAID;
          shouldAssignGroup = true;
          break;
        case 'canceled':
        case 'unpaid':
        case 'past_due':
          invoiceStatus = ChildrenInvoiceStatus.CANCELED;
          shouldAssignGroup = false;
          break;
        default:
          shouldAssignGroup = false;
      }

      // Update invoice if we have an invoice ID
      if (invoiceId) {
        await this.upsertInvoiceRecord({
          children_id: children.id,
          external_id: invoiceId,
          amount: this.extractSubscriptionAmount(subscription),
          status: invoiceStatus,
          metadata: { subscription_updated: JSON.stringify(subscription) },
        });
      }

      // Update group assignment
      if (shouldAssignGroup && children.group_id) {
        await this.updateChildrenGroupStatus(
          children.id,
          children.group_id,
          'Subscription active'
        );
      } else {
        await this.updateChildrenGroupStatus(
          children.id,
          null,
          `Subscription ${subscription.status}`
        );
      }

      return {
        handled: true,
        data: {
          subscription_id: subscription.id,
          status: subscription.status,
          children_id: children.id,
        },
      };
    } catch (error) {
      return {
        handled: false,
        error: (error as Error).message,
        reason: 'Error processing subscription update',
      };
    }
  }

  private async handleSubscriptionDeleted(
    event: Stripe.Event
  ): Promise<WebhookResult> {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    try {
      const children = await this.findChildrenByCustomerId(customerId);
      if (!children) {
        return {
          handled: false,
          reason: `Children not found for customer: ${customerId}`,
        };
      }

      const invoiceId = this.extractInvoiceId(subscription);
      if (invoiceId) {
        await this.upsertInvoiceRecord({
          children_id: children.id,
          external_id: invoiceId,
          status: ChildrenInvoiceStatus.CANCELED,
          amount: this.extractSubscriptionAmount(subscription),
          metadata: { subscription_deleted: JSON.stringify(subscription) },
        });
      }

      // Remove children from group
      await this.updateChildrenGroupStatus(
        children.id,
        null,
        'Subscription deleted'
      );

      return {
        handled: true,
        data: {
          subscription_id: subscription.id,
          children_id: children.id,
          action: 'deleted',
        },
      };
    } catch (error) {
      return {
        handled: false,
        error: (error as Error).message,
        reason: 'Error processing subscription deletion',
      };
    }
  }

  private async handleSubscriptionPausedResumed(
    event: Stripe.Event
  ): Promise<WebhookResult> {
    const subscription = event.data.object as Stripe.Subscription;
    const isPaused = event.type === 'customer.subscription.paused';
    const customerId = subscription.customer as string;

    try {
      const children = await this.findChildrenByCustomerId(customerId);
      if (!children) {
        return {
          handled: false,
          reason: `Children not found for customer: ${customerId}`,
        };
      }

      const invoiceId = this.extractInvoiceId(subscription);
      const status = isPaused
        ? ChildrenInvoiceStatus.PENDING
        : ChildrenInvoiceStatus.PAID;

      if (invoiceId) {
        await this.upsertInvoiceRecord({
          children_id: children.id,
          external_id: invoiceId,
          status,
          amount: this.extractSubscriptionAmount(subscription),
          metadata: {
            [`subscription_${isPaused ? 'paused' : 'resumed'}`]:
              JSON.stringify(subscription),
          },
        });
      }

      // Update group assignment
      const groupId = isPaused ? null : children.group_id;
      await this.updateChildrenGroupStatus(
        children.id,
        groupId,
        `Subscription ${isPaused ? 'paused' : 'resumed'}`
      );

      return {
        handled: true,
        data: {
          subscription_id: subscription.id,
          children_id: children.id,
          status: isPaused ? 'paused' : 'resumed',
        },
      };
    } catch (error) {
      return {
        handled: false,
        error: (error as Error).message,
        reason: `Error processing subscription ${isPaused ? 'pause' : 'resume'}`,
      };
    }
  }

  private async handleInvoiceCreatedOrFinalized(
    event: Stripe.Event
  ): Promise<WebhookResult> {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;

    try {
      const children = await this.findChildrenByCustomerId(customerId);
      if (!children) {
        return {
          handled: false,
          reason: `Children not found for customer: ${customerId}`,
        };
      }

      // Create or update invoice record regardless of group assignment
      const success = await this.upsertInvoiceRecord({
        children_id: children.id,
        external_id: invoice.id,
        amount: invoice.amount_due || 0,
        status: ChildrenInvoiceStatus.PENDING,
        metadata: {
          [`invoice_${event.type.split('.')[1]}`]: JSON.stringify(invoice),
        },
      });

      return {
        handled: success,
        data: success
          ? { children_id: children.id, invoice_id: invoice.id }
          : undefined,
        reason: success ? undefined : 'Failed to create/update invoice record',
      };
    } catch (error) {
      return {
        handled: false,
        error: (error as Error).message,
        reason: `Error processing invoice ${event.type}`,
      };
    }
  }

  private async handleInvoicePaid(event: Stripe.Event): Promise<WebhookResult> {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;

    try {
      const children = await this.findChildrenByCustomerId(customerId);
      if (!children) {
        return {
          handled: false,
          reason: `Children not found for customer: ${customerId}`,
        };
      }

      // Update invoice to paid status
      const success = await this.upsertInvoiceRecord({
        children_id: children.id,
        external_id: invoice.id,
        amount: invoice.amount_paid || 0,
        status: ChildrenInvoiceStatus.PAID,
        metadata: { invoice_paid: JSON.stringify(invoice) },
      });

      // Assign to group if payment successful and group exists
      if (success && children.group_id) {
        await this.updateChildrenGroupStatus(
          children.id,
          children.group_id,
          'Payment successful'
        );
      }

      return {
        handled: success,
        data: success
          ? {
              children_id: children.id,
              invoice_id: invoice.id,
              amount_paid: invoice.amount_paid,
            }
          : undefined,
        reason: success ? undefined : 'Failed to process payment',
      };
    } catch (error) {
      return {
        handled: false,
        error: (error as Error).message,
        reason: 'Error processing invoice payment',
      };
    }
  }

  private async handleInvoicePaymentFailed(
    event: Stripe.Event
  ): Promise<WebhookResult> {
    const invoice = event.data.object as Stripe.Invoice;
    const isActionRequired = event.type === 'invoice.payment_action_required';
    const customerId = invoice.customer as string;

    try {
      const children = await this.findChildrenByCustomerId(customerId);
      if (!children) {
        return {
          handled: false,
          reason: `Children not found for customer: ${customerId}`,
        };
      }

      const status = isActionRequired
        ? ChildrenInvoiceStatus.PENDING
        : ChildrenInvoiceStatus.FAILED;

      const success = await this.upsertInvoiceRecord({
        children_id: children.id,
        external_id: invoice.id,
        amount: invoice.amount_due || 0,
        status,
        metadata: { invoice_payment_failed: JSON.stringify(invoice) },
      });

      // Remove from group on payment failure
      await this.updateChildrenGroupStatus(
        children.id,
        null,
        `Payment ${isActionRequired ? 'action required' : 'failed'}`
      );

      return {
        handled: success,
        data: success
          ? {
              children_id: children.id,
              invoice_id: invoice.id,
              status: isActionRequired ? 'action_required' : 'failed',
            }
          : undefined,
        reason: success ? undefined : 'Failed to process payment failure',
      };
    } catch (error) {
      return {
        handled: false,
        error: (error as Error).message,
        reason: 'Error processing invoice payment failure',
      };
    }
  }

  private async handleInvoiceFinalizationFailed(
    event: Stripe.Event
  ): Promise<WebhookResult> {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;

    try {
      const children = await this.findChildrenByCustomerId(customerId);
      if (!children) {
        return {
          handled: false,
          reason: `Children not found for customer: ${customerId}`,
        };
      }

      const success = await this.upsertInvoiceRecord({
        children_id: children.id,
        external_id: invoice.id,
        amount: invoice.amount_due || 0,
        status: ChildrenInvoiceStatus.FAILED,
        metadata: { invoice_finalization_failed: JSON.stringify(invoice) },
      });

      return {
        handled: success,
        data: success
          ? {
              children_id: children.id,
              invoice_id: invoice.id,
              status: 'finalization_failed',
            }
          : undefined,
        reason: success ? undefined : 'Failed to process finalization failure',
      };
    } catch (error) {
      return {
        handled: false,
        error: (error as Error).message,
        reason: 'Error processing invoice finalization failure',
      };
    }
  }

  private async handleInvoiceUpdated(
    event: Stripe.Event
  ): Promise<WebhookResult> {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;

    try {
      const children = await this.findChildrenByCustomerId(customerId);
      if (!children) {
        return {
          handled: false,
          reason: `Children not found for customer: ${customerId}`,
        };
      }

      // Determine status based on invoice status
      let status = ChildrenInvoiceStatus.PENDING;
      if (invoice.status === 'paid') {
        status = ChildrenInvoiceStatus.PAID;
      } else if (invoice.status === 'draft') {
        status = ChildrenInvoiceStatus.PENDING;
      }

      const success = await this.upsertInvoiceRecord({
        children_id: children.id,
        external_id: invoice.id,
        amount: invoice.amount_due || 0,
        status,
        metadata: { invoice_updated: JSON.stringify(invoice) },
      });

      return {
        handled: success,
        data: success
          ? { children_id: children.id, invoice_id: invoice.id }
          : undefined,
        reason: success ? undefined : 'Failed to update invoice',
      };
    } catch (error) {
      return {
        handled: false,
        error: (error as Error).message,
        reason: 'Error processing invoice update',
      };
    }
  }

  // Helper method to get subscription status for a children
  async getChildrenSubscriptionStatus() {
    const invoices = await this.childrenInvoiceService.findAll();

    const activeInvoice = invoices.data?.find(
      (inv) => inv.status === 'active' || inv.status === 'paid'
    );
    const latestInvoice = invoices.data?.[invoices.data.length - 1];

    return {
      has_active_subscription: !!activeInvoice,
      latest_payment_status: latestInvoice?.status || 'none',
      total_invoices: invoices.data?.length || 0,
      invoices: invoices.data,
    };
  }

  async subscribeToGroup(
    id: number,
    group_id: number
  ): Promise<APIResponse<IChildrenResponse | undefined | string>> {
    try {
      const children = await this.childrenService.findOne(id);
      if (!children.data) {
        return APIResponse.error<undefined>({
          message: 'Children not found',
          statusCode: 404,
        });
      }

      const group = await this.groupService.findOne(group_id);
      if (!group.data) {
        return APIResponse.error<undefined>({
          message: 'Group not found',
          statusCode: 404,
        });
      }

      // Store the intended group_id for webhook processing
      await this.childrenService.update(id, { group_id: group_id });

      // Check if children has external_id and group has external_id for Stripe subscription
      if (children.data.external_id && group.data.external_id) {
        try {
          const subscription = await this.createSubscription(
            children.data.external_id,
            group.data.external_id
          );

          if (subscription.latest_invoice) {
            const hostedInvoiceUrl = (
              subscription.latest_invoice as Stripe.Invoice
            ).hosted_invoice_url;

            return APIResponse.success<string>({
              message:
                'Subscription created successfully. Group assignment will be activated after payment.',
              data: hostedInvoiceUrl || '',
              statusCode: 200,
            });
          }

          return APIResponse.error<undefined>({
            message: 'Failed to create subscription - no invoice generated',
            statusCode: 500,
          });
        } catch (subscriptionError) {
          this.logger.error(
            `Stripe subscription error: ${(subscriptionError as Error).message}`
          );
          return APIResponse.error<undefined>({
            message: `Failed to create subscription: ${(subscriptionError as Error).message}`,
            statusCode: 500,
          });
        }
      }

      // Fallback: If no Stripe integration, group is already assigned above
      const updatedChildren = await this.childrenService.findOne(id);

      return APIResponse.success<IChildrenResponse>({
        message: 'Children assigned to group successfully',
        data: updatedChildren.data,
        statusCode: 200,
      });
    } catch (error) {
      this.logger.error(
        `Error in subscribeToGroup: ${(error as Error).message}`
      );
      return APIResponse.error<undefined>({
        message: `Failed to process subscription: ${(error as Error).message}`,
        statusCode: 500,
      });
    }
  }
}
