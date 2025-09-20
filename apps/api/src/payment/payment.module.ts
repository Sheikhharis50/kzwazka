import { Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { DbModule } from '../db/db.module';
import { GroupModule } from '../group/group.module';
import { ChildrenModule } from '../children/children.module';

@Module({
  imports: [DbModule, GroupModule, forwardRef(() => ChildrenModule)],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
