import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { ProductVisit } from './entities/product-visit.entity';
import { BuyerSellerContact } from './entities/buyer-seller-contact.entity';
import { Order } from '../orders/orders.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductVisit, BuyerSellerContact, Order])],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
