import { Module } from '@nestjs/common';

import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';

import { WebhookModule } from '../webhook/webhook.module';

@Module({
  imports: [WebhookModule],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService],
})
export class WorkOrdersModule {}