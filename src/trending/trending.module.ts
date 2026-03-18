import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategorySearch } from './category-search.entity';
import { TrendingService } from './trending.service';
import { TrendingController } from './trending.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategorySearch])],
  controllers: [TrendingController],
  providers: [TrendingService],
  exports: [TrendingService],
})
export class TrendingModule {}
