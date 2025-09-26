import { PartialType } from '@nestjs/swagger';
import { SubscribeToGroupDto } from './create-payment.dto';

export class UpdatePaymentDto extends PartialType(SubscribeToGroupDto) {}
