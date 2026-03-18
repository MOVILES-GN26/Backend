import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { TrendingService } from './trending.service';

@Controller('trending')
export class TrendingController {
  constructor(private readonly trendingService: TrendingService) {}

  /** GET /trending/categories — returns top 5 categories of the last 7 days. */
  @Get('categories')
  @SkipThrottle()
  getTrendingCategories() {
    return this.trendingService.getTrendingCategories();
  }
}
