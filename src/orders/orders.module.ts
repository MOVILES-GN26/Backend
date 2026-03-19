import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './orders.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, User]), StorageModule],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
