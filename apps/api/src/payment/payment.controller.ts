import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentService, WebhookResult } from './payment.service';
import Stripe from 'stripe';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('api/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  create(@Body() event: Stripe.Event): Promise<WebhookResult> {
    return this.paymentService.processWebhookEvent(event);
  }

  @Post('subscribe-group')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Subscribe children to group',
    description: 'Creates a Stripe subscription for children to join a group',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        group_id: { type: 'number' },
      },
    },
  })
  subscribeToGroup(@Body() body: { id: number; group_id: number }) {
    return this.paymentService.subscribeToGroup(body.id, body.group_id);
  }
}
