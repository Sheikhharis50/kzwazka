import { Module, forwardRef } from '@nestjs/common';
import { PaymentModule } from '../payment/payment.module';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { DbModule } from '../db/db.module';
import { EmailService, FileStorageService } from '../services';
import { SharedJwtModule } from '../auth/jwt.module';
import { UserService } from '../user/user.service';
import { ChildrenInvoiceService } from './children-invoice.service';

@Module({
  imports: [DbModule, SharedJwtModule, forwardRef(() => PaymentModule)],
  controllers: [ChildrenController],
  providers: [
    ChildrenService,
    ChildrenInvoiceService,
    EmailService,
    FileStorageService,
    UserService,
  ],
  exports: [ChildrenService, ChildrenInvoiceService],
})
export class ChildrenModule {}
