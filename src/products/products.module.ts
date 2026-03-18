import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { StorageModule } from '../storage/storage.module';
import { TrendingModule } from '../trending/trending.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), StorageModule, TrendingModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
