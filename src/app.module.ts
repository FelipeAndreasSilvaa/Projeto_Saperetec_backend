import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { WebhookModule } from './webhook/webhook.module';



@Module({
  imports: [ 
    ConfigModule.forRoot({
    isGlobal: true,
  }),
  AuthModule, 
  UsersModule, 
  WorkOrdersModule, 
  HealthModule, 
  PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
