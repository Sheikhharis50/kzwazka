import { PartialType } from '@nestjs/swagger';
import { CreateChildrenInvoiceDto } from './create-children-invoice.dto';

export class UpdateChildrenInvoiceDto extends PartialType(
  CreateChildrenInvoiceDto
) {}
