import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentService, WebhookResult } from './payment.service';
import Stripe from 'stripe';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { SubscribeToGroupDto } from './dto/create-payment.dto';
import { APIRequest } from '../interfaces/request';

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
  subscribeToGroup(@Body() body: SubscribeToGroupDto, @Req() req: APIRequest) {
    return this.paymentService.subscribeToGroup(body, req.user.id);
  }

  @Post('customer-portal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a customer portal session',
    description: 'Creates a Stripe customer portal session',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        return_url: { type: 'string' },
      },
    },
  })
  createCustomerPortalSession(
    @Req() req: APIRequest,
    @Body() body: { return_url: string }
  ) {
    return this.paymentService.createCustomerPortalSession(
      req.user.id,
      body.return_url
    );
  }
}
