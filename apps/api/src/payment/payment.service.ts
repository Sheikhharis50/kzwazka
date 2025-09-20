import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';
import { DatabaseService } from '../db/drizzle.service';
import { eq, and, isNotNull } from 'drizzle-orm';
import { childrenSchema, childrenInvoiceSchema, Children } from '../db/schemas';
import { APIResponse } from 'src/utils/response';
import { GroupService } from '../group/group.service';
import { ChildrenService } from '../children/children.service';
import { ChildrenInvoiceService } from '../children/children-invoice.service';
import { ChildrenInvoiceStatus } from '../utils/constants';

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

  async processWebhookEvent(event: Stripe.Event): Promise<any> {
    try {
      switch (event.type) {
        case 'customer.created':
          return await this.handleCustomerCreated(event);
        case 'customer.subscription.created':
          return await this.handleSubscriptionCreated(event);
        case 'customer.subscription.updated':
          return await this.handleSubscriptionUpdated(event);
        case 'customer.subscription.deleted':
          return await this.handleSubscriptionDeleted(event);
        case 'customer.subscription.paused':
          return await this.handleSubscriptionPaused(event);
        case 'customer.subscription.resumed':
          return await this.handleSubscriptionResumed(event);
        case 'invoice.created':
          return await this.handleInvoiceCreated(event);
        case 'invoice.finalized':
          return await this.handleInvoiceFinalized(event);
        case 'invoice.payment_succeeded':
          return await this.handleInvoicePaymentSucceeded(event);
        case 'invoice.payment_failed':
          return await this.handleInvoicePaymentFailed(event);
        case 'invoice.payment_action_required':
          return await this.handleInvoicePaymentActionRequired(event);
        default:
          this.logger.warn(`Unhandled event type: ${event.type}`);
          return { handled: false, type: event.type };
      }
    } catch (error) {
      this.logger.error(
        `Error processing webhook event ${event.type}: ${(error as Error).message}`
      );
      throw error;
    }
  }

  private handleCustomerCreated(event: Stripe.Event): any {
    const customer = event.data.object as Stripe.Customer;
    this.logger.log(`Processing customer.created: ${customer.id}`);

    console.log('Customer Webhook', customer);

    try {
      // Log customer creation for tracking
      this.logger.log(
        `New customer created: ${customer.id} - Email: ${customer.email}`
      );

      return {
        handled: true,
        customer_id: customer.id,
        email: customer.email,
      };
    } catch (error) {
      this.logger.error(
        `Error handling customer.created: ${(error as Error).message}`
      );
      throw error;
    }
  }

  private async handleSubscriptionPaused(event: Stripe.Event): Promise<any> {
    const subscription = event.data.object as Stripe.Subscription;
    this.logger.log(`Processing subscription.paused: ${subscription.id}`);

    console.log('Subscription Paused Webhook', subscription);

    try {
      // Find existing invoice record
      const [existingInvoice] = await this.dbService.db
        .select()
        .from(childrenInvoiceSchema)
        .where(eq(childrenInvoiceSchema.external_id, subscription.id))
        .limit(1);

      if (existingInvoice) {
        // Update invoice record to paused status
        await this.dbService.db
          .update(childrenInvoiceSchema)
          .set({
            status: ChildrenInvoiceStatus.PAUSED,
            metadata: {
              ...(existingInvoice.metadata as any),
              subscription_paused: {
                subscription_id: subscription.id,
                customer_id: subscription.customer as string,
                paused_at: subscription.pause_collection?.resumes_at
                  ? new Date(
                      subscription.pause_collection.resumes_at * 1000
                    ).toISOString()
                  : null,
                paused_at_timestamp: new Date().toISOString(),
              },
            },
            updated_at: new Date(),
          })
          .where(eq(childrenInvoiceSchema.id, existingInvoice.id));

        this.logger.log(`Subscription paused: ${subscription.id}`);
        return {
          handled: true,
          subscription_id: subscription.id,
          status: 'paused',
        };
      }

      this.logger.warn(
        `Invoice record not found for paused subscription: ${subscription.id}`
      );
      return { handled: false, reason: 'Invoice record not found' };
    } catch (error) {
      this.logger.error(
        `Error handling subscription.paused: ${(error as Error).message}`
      );
      throw error;
    }
  }

  private async handleSubscriptionResumed(event: Stripe.Event): Promise<any> {
    const subscription = event.data.object as Stripe.Subscription;
    this.logger.log(`Processing subscription.resumed: ${subscription.id}`);

    console.log('Subscription Resumed Webhook', subscription);

    try {
      // Find existing invoice record
      const [existingInvoice] = await this.dbService.db
        .select()
        .from(childrenInvoiceSchema)
        .where(eq(childrenInvoiceSchema.external_id, subscription.id))
        .limit(1);

      if (existingInvoice) {
        // Update invoice record to active status
        await this.dbService.db
          .update(childrenInvoiceSchema)
          .set({
            status: ChildrenInvoiceStatus.ACTIVE,
            metadata: {
              ...(existingInvoice.metadata as any),
              subscription_resumed: {
                subscription_id: subscription.id,
                customer_id: subscription.customer as string,
                resumed_at: new Date().toISOString(),
              },
            },
            updated_at: new Date(),
          })
          .where(eq(childrenInvoiceSchema.id, existingInvoice.id));

        this.logger.log(`Subscription resumed: ${subscription.id}`);
        return {
          handled: true,
          subscription_id: subscription.id,
          status: 'active',
        };
      }

      this.logger.warn(
        `Invoice record not found for resumed subscription: ${subscription.id}`
      );
      return { handled: false, reason: 'Invoice record not found' };
    } catch (error) {
      this.logger.error(
        `Error handling subscription.resumed: ${(error as Error).message}`
      );
      throw error;
    }
  }

  private async handleSubscriptionCreated(event: Stripe.Event): Promise<any> {
    const subscription = event.data.object as Stripe.Subscription;
    this.logger.log(`Processing subscription.created: ${subscription.id}`);

    console.log('Subscription Created Webhook', subscription);

    try {
      // Find the children by customer ID
      const [children] = await this.dbService.db
        .select({
          id: childrenSchema.id,
          user_id: childrenSchema.user_id,
          group_id: childrenSchema.group_id,
        })
        .from(childrenSchema)
        .where(eq(childrenSchema.external_id, subscription.customer as string))
        .limit(1);

      if (!children) {
        this.logger.warn(
          `Children not found for customer: ${subscription.customer as string}`
        );
        return { handled: false, reason: 'Customer not found' };
      }

      console.log(subscription);

      // Get current period from subscription items
      const currentPeriodStart =
        subscription.items.data[0]?.current_period_start;
      const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

      // Create invoice record for subscription creation
      await this.dbService.db.insert(childrenInvoiceSchema).values({
        children_id: children.id,
        group_id: children.group_id || 0, // Handle null case
        external_id: subscription.id,
        amount: subscription.items.data[0].price.unit_amount || 0,
        status: ChildrenInvoiceStatus.ACTIVE,
        metadata: {
          subscription_created: {
            subscription_id: subscription.id,
            customer_id: subscription.customer as string,
            status: subscription.status,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            created_at: new Date().toISOString(),
          },
        },
      });

      this.logger.log(
        `Subscription created record for children: ${children.id}`
      );
      return {
        handled: true,
        children_id: children.id,
        subscription_id: subscription.id,
      };
    } catch (error) {
      this.logger.error(
        `Error handling subscription.created: ${(error as Error).message}`
      );
      throw error;
    }
  }

  private async handleSubscriptionUpdated(event: Stripe.Event): Promise<any> {
    const subscription = event.data.object as Stripe.Subscription;
    this.logger.log(
      `Processing subscription.updated: ${subscription.id} - Status: ${subscription.status}`
    );

    console.log('Subscription Updated Webhook', subscription);

    try {
      // Find existing invoice record
      const [existingInvoice] = await this.dbService.db
        .select()
        .from(childrenInvoiceSchema)
        .where(eq(childrenInvoiceSchema.external_id, subscription.id))
        .limit(1);

      if (existingInvoice) {
        // Get current period from subscription items
        const currentPeriodStart =
          subscription.items.data[0]?.current_period_start;
        const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

        // Determine status based on subscription status
        let invoiceStatus = ChildrenInvoiceStatus.PENDING;
        if (subscription.status === 'active') {
          invoiceStatus = ChildrenInvoiceStatus.ACTIVE;
        } else if (
          subscription.status === 'canceled' ||
          subscription.status === 'unpaid'
        ) {
          invoiceStatus = ChildrenInvoiceStatus.CANCELED;
        }

        // Update existing invoice record
        await this.dbService.db
          .update(childrenInvoiceSchema)
          .set({
            status: invoiceStatus,
            metadata: {
              ...(existingInvoice.metadata as any),
              subscription_updated: {
                subscription_id: subscription.id,
                customer_id: subscription.customer as string,
                status: subscription.status,
                current_period_start: currentPeriodStart,
                current_period_end: currentPeriodEnd,
                cancel_at_period_end: subscription.cancel_at_period_end,
                updated_at: new Date().toISOString(),
              },
            },
            updated_at: new Date(),
          })
          .where(eq(childrenInvoiceSchema.id, existingInvoice.id));

        // If subscription is canceled or unpaid, we might want to update children's group_id
        if (
          subscription.status === 'canceled' ||
          subscription.status === 'unpaid'
        ) {
          const [children] = await this.dbService.db
            .select()
            .from(childrenSchema)
            .where(
              eq(childrenSchema.external_id, subscription.customer as string)
            )
            .limit(1);

          if (children) {
            // Optionally remove from group or mark as inactive
            this.logger.log(
              `Subscription ${subscription.status} for children: ${children.id}`
            );
          }
        }

        this.logger.log(
          `Updated subscription record: ${subscription.id} - Status: ${subscription.status}`
        );
        return {
          handled: true,
          subscription_id: subscription.id,
          status: subscription.status,
        };
      }

      this.logger.warn(
        `Invoice record not found for subscription: ${subscription.id}`
      );
      return { handled: false, reason: 'Invoice record not found' };
    } catch (error) {
      this.logger.error(
        `Error handling subscription.updated: ${(error as Error).message}`
      );
      throw error;
    }
  }

  private async handleSubscriptionDeleted(event: Stripe.Event): Promise<any> {
    const subscription = event.data.object as Stripe.Subscription;
    this.logger.log(`Processing subscription.deleted: ${subscription.id}`);

    console.log('Subscription Deleted Webhook', subscription);

    try {
      // Update invoice record
      await this.dbService.db
        .update(childrenInvoiceSchema)
        .set({
          status: ChildrenInvoiceStatus.CANCELED,
          metadata: {
            subscription_deleted: {
              subscription_id: subscription.id,
              customer_id: subscription.customer as string,
              status: 'canceled',
              canceled_at: subscription.canceled_at,
              deleted_at: new Date().toISOString(),
            },
          },
          updated_at: new Date(),
        })
        .where(eq(childrenInvoiceSchema.external_id, subscription.id));

      // Find and update children - remove from group or mark inactive
      const [children] = await this.dbService.db
        .select()
        .from(childrenSchema)
        .where(eq(childrenSchema.external_id, subscription.customer as string))
        .limit(1);

      if (children) {
        // Remove children from group when subscription is deleted
        await this.dbService.db
          .update(childrenSchema)
          .set({ group_id: null, updated_at: new Date() })
          .where(eq(childrenSchema.id, children.id));

        this.logger.log(
          `Removed children ${children.id} from group due to subscription cancellation`
        );
      }

      return {
        handled: true,
        subscription_id: subscription.id,
        action: 'subscription_deleted',
      };
    } catch (error) {
      this.logger.error(
        `Error handling subscription.deleted: ${(error as Error).message}`
      );
      throw error;
    }
  }

  private async handleInvoicePaymentSucceeded(
    event: Stripe.Event
  ): Promise<any> {
    const invoice = event.data.object as Stripe.Invoice;
    this.logger.log(
      `Processing invoice.payment_succeeded: ${invoice.id} - Amount: ${invoice.amount_paid}`
    );

    console.log('Invoice Payment Succeeded Webhook', invoice);

    try {
      // Find children by customer ID
      const [children] = await this.dbService.db
        .select({
          id: childrenSchema.id,
          group_id: childrenSchema.group_id,
          user_id: childrenSchema.user_id,
        })
        .from(childrenSchema)
        .where(eq(childrenSchema.external_id, invoice.customer as string))
        .limit(1);

      if (!children) {
        this.logger.warn(
          `Children not found for customer: ${invoice.customer as string}`
        );
        return { handled: false, reason: 'Customer not found' };
      }

      // Create successful payment invoice record
      await this.dbService.db.insert(childrenInvoiceSchema).values({
        children_id: children.id,
        group_id: children.group_id || 0, // Handle null case
        external_id: invoice.id!,
        amount: invoice.amount_paid,
        status: ChildrenInvoiceStatus.PAID,
        metadata: {
          invoice_payment_succeeded: {
            invoice_id: invoice.id,
            customer_id: invoice.customer as string,
            amount_paid: invoice.amount_paid,
            currency: invoice.currency,
            period_start: invoice.period_start,
            period_end: invoice.period_end,
            paid_at: new Date(
              invoice.status_transitions.paid_at! * 1000
            ).toISOString(),
          },
        },
      });

      this.logger.log(
        `Created payment success record for children: ${children.id} - Amount: ${invoice.amount_paid}`
      );
      return {
        handled: true,
        children_id: children.id,
        invoice_id: invoice.id,
        amount_paid: invoice.amount_paid,
      };
    } catch (error) {
      this.logger.error(
        `Error handling invoice.payment_succeeded: ${(error as Error).message}`
      );
      throw error;
    }
  }

  private async handleInvoicePaymentFailed(event: Stripe.Event): Promise<any> {
    const invoice = event.data.object as Stripe.Invoice;
    this.logger.log(
      `Processing invoice.payment_failed: ${invoice.id} - Amount: ${invoice.amount_due}`
    );

    console.log('Invoice Payment Failed Webhook', invoice);

    try {
      // Find children by customer ID
      const [children] = await this.dbService.db
        .select({
          id: childrenSchema.id,
          group_id: childrenSchema.group_id,
          user_id: childrenSchema.user_id,
        })
        .from(childrenSchema)
        .where(eq(childrenSchema.external_id, invoice.customer as string))
        .limit(1);

      if (!children) {
        this.logger.warn(
          `Children not found for customer: ${invoice.customer as string}`
        );
        return { handled: false, reason: 'Customer not found' };
      }

      // Create failed payment invoice record
      await this.dbService.db.insert(childrenInvoiceSchema).values({
        children_id: children.id,
        group_id: children.group_id || 0, // Handle null case
        external_id: invoice.id!,
        amount: invoice.amount_due,
        status: ChildrenInvoiceStatus.FAILED,
        metadata: {
          invoice_payment_failed: {
            invoice_id: invoice.id,
            customer_id: invoice.customer as string,
            amount_due: invoice.amount_due,
            currency: invoice.currency,
            attempt_count: invoice.attempt_count,
            next_payment_attempt: invoice.next_payment_attempt,
            failed_at: new Date().toISOString(),
          },
        },
      });

      this.logger.warn(
        `Payment failed for children: ${children.id} - Invoice: ${invoice.id}`
      );
      return {
        handled: true,
        children_id: children.id,
        invoice_id: invoice.id,
        amount_due: invoice.amount_due,
        status: 'payment_failed',
      };
    } catch (error) {
      this.logger.error(
        `Error handling invoice.payment_failed: ${(error as Error).message}`
      );
      throw error;
    }
  }

  private async handleInvoiceCreated(event: Stripe.Event): Promise<any> {
    const invoice = event.data.object as Stripe.Invoice;
    this.logger.log(`Processing invoice.created: ${invoice.id}`);

    try {
      // Find children by customer ID
      const [children] = await this.dbService.db
        .select({
          id: childrenSchema.id,
          group_id: childrenSchema.group_id,
        })
        .from(childrenSchema)
        .where(eq(childrenSchema.external_id, invoice.customer as string))
        .limit(1);

      if (!children) {
        this.logger.warn(
          `Children not found for customer: ${invoice.customer as string}`
        );
        return { handled: false, reason: 'Customer not found' };
      }

      // Create pending invoice record
      await this.dbService.db.insert(childrenInvoiceSchema).values({
        children_id: children.id,
        group_id: children.group_id || 0, // Handle null case
        external_id: invoice.id!,
        amount: invoice.amount_due,
        status: ChildrenInvoiceStatus.PENDING,
        metadata: {
          invoice_created: {
            invoice_id: invoice.id,
            customer_id: invoice.customer as string,
            amount_due: invoice.amount_due,
            currency: invoice.currency,
            due_date: invoice.due_date
              ? new Date(invoice.due_date * 1000).toISOString()
              : null,
            created_at: new Date().toISOString(),
          },
        },
      });

      this.logger.log(
        `Created pending invoice record for children: ${children.id}`
      );
      return {
        handled: true,
        children_id: children.id,
        invoice_id: invoice.id,
      };
    } catch (error) {
      this.logger.error(
        `Error handling invoice.created: ${(error as Error).message}`
      );
      throw error;
    }
  }

  private async handleInvoiceFinalized(event: Stripe.Event): Promise<any> {
    const invoice = event.data.object as Stripe.Invoice;
    this.logger.log(`Processing invoice.finalized: ${invoice.id}`);

    console.log('Invoice Finalized Webhook', invoice);

    try {
      // Find children by customer ID
      const [children] = await this.dbService.db
        .select({
          id: childrenSchema.id,
          group_id: childrenSchema.group_id,
        })
        .from(childrenSchema)
        .where(eq(childrenSchema.external_id, invoice.customer as string))
        .limit(1);

      if (!children) {
        this.logger.warn(
          `Children not found for customer: ${invoice.customer as string}`
        );
        return { handled: false, reason: 'Customer not found' };
      }

      // Update existing invoice record or create new one
      const [existingInvoice] = await this.dbService.db
        .select()
        .from(childrenInvoiceSchema)
        .where(
          and(
            eq(childrenInvoiceSchema.external_id, invoice.id!),
            isNotNull(childrenInvoiceSchema.external_id)
          )
        )
        .limit(1);

      if (existingInvoice) {
        // Update existing record
        await this.dbService.db
          .update(childrenInvoiceSchema)
          .set({
            status: ChildrenInvoiceStatus.FINALIZED,
            amount: invoice.amount_due,
            metadata: {
              ...(existingInvoice.metadata as any),
              invoice_finalized: {
                invoice_id: invoice.id,
                customer_id: invoice.customer as string,
                amount_due: invoice.amount_due,
                currency: invoice.currency,
                finalized_at: new Date().toISOString(),
              },
            },
            updated_at: new Date(),
          })
          .where(eq(childrenInvoiceSchema.id, existingInvoice.id));
      } else {
        // Create new finalized invoice record
        await this.dbService.db.insert(childrenInvoiceSchema).values({
          children_id: children.id,
          group_id: children.group_id || 0, // Handle null case
          external_id: invoice.id!,
          amount: invoice.amount_due,
          status: ChildrenInvoiceStatus.FINALIZED,
          metadata: {
            invoice_finalized: {
              invoice_id: invoice.id,
              customer_id: invoice.customer as string,
              amount_due: invoice.amount_due,
              currency: invoice.currency,
              finalized_at: new Date().toISOString(),
            },
          },
        });
      }

      this.logger.log(`Invoice finalized for children: ${children.id}`);
      return {
        handled: true,
        children_id: children.id,
        invoice_id: invoice.id,
      };
    } catch (error) {
      this.logger.error(
        `Error handling invoice.finalized: ${(error as Error).message}`
      );
      throw error;
    }
  }

  private async handleInvoicePaymentActionRequired(
    event: Stripe.Event
  ): Promise<any> {
    const invoice = event.data.object as Stripe.Invoice;
    this.logger.log(
      `Processing invoice.payment_action_required: ${invoice.id}`
    );

    try {
      // Find children by customer ID
      const [children] = await this.dbService.db
        .select({
          id: childrenSchema.id,
          group_id: childrenSchema.group_id,
        })
        .from(childrenSchema)
        .where(eq(childrenSchema.external_id, invoice.customer as string))
        .limit(1);

      if (!children) {
        this.logger.warn(
          `Children not found for customer: ${invoice.customer as string}`
        );
        return { handled: false, reason: 'Customer not found' };
      }

      // Create action required invoice record
      await this.dbService.db.insert(childrenInvoiceSchema).values({
        children_id: children.id,
        group_id: children.group_id || 0, // Handle null case
        external_id: invoice.id!,
        amount: invoice.amount_due,
        status: ChildrenInvoiceStatus.ACTION_REQUIRED,
        metadata: {
          invoice_payment_action_required: {
            invoice_id: invoice.id,
            customer_id: invoice.customer as string,
            amount_due: invoice.amount_due,
            currency: invoice.currency,
            action_required_at: new Date().toISOString(),
          },
        },
      });

      this.logger.warn(
        `Payment action required for children: ${children.id} - Invoice: ${invoice.id}`
      );
      return {
        handled: true,
        children_id: children.id,
        invoice_id: invoice.id,
        status: 'action_required',
      };
    } catch (error) {
      this.logger.error(
        `Error handling invoice.payment_action_required: ${(error as Error).message}`
      );
      throw error;
    }
  }

  // Helper method to get subscription status for a children
  async getChildrenSubscriptionStatus(childrenId: number) {
    const invoices = await this.dbService.db
      .select()
      .from(childrenInvoiceSchema)
      .where(eq(childrenInvoiceSchema.children_id, childrenId))
      .orderBy(childrenInvoiceSchema.created_at);

    const activeInvoice = invoices.find(
      (inv) => inv.status === 'active' || inv.status === 'paid'
    );
    const latestInvoice = invoices[invoices.length - 1];

    return {
      has_active_subscription: !!activeInvoice,
      latest_payment_status: latestInvoice?.status || 'none',
      total_invoices: invoices.length,
      invoices,
    };
  }

  async subscribeToGroup(
    id: number,
    group_id: number
  ): Promise<APIResponse<Children | undefined>> {
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
    try {
      if (children.data.external_id && group.data.external_id) {
        const subscription = await this.createSubscription(
          children.data.external_id,
          group.data.external_id
        );
        console.log(subscription);
      }
      const [updatedChildren] = await this.dbService.db
        .update(childrenSchema)
        .set({ group_id: group_id })
        .where(eq(childrenSchema.id, id))
        .returning();
      return APIResponse.success<Children>({
        message: 'Children subscribed to group successfully',
        data: updatedChildren,
        statusCode: 200,
      });
    } catch (error) {
      return APIResponse.error<undefined>({
        message: `Failed to subscribe children to group ${(error as Error).message}`,
        statusCode: 500,
      });
    }
  }
}
