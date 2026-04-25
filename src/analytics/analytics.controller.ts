import { Controller, Post, Body, UseGuards, Req, Get, Query } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard';
import { AnalyticsService } from './analytics.service';
import { ProductVisitDto } from './dto/product-visit.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Record a product visit. Body: { product_id | productId, source }
   */
  @Post('product-visit')
  @UseGuards(OptionalJwtGuard)
  recordVisit(@Body() dto: ProductVisitDto, @Req() req: any) {
    // product_id is normalized by DTO transform
    this.analyticsService.recordVisit(dto.product_id, dto.source as any);
    return { ok: true };
  }

  /**
   * Get percentage breakdown by source. Optional query `productId` to filter.
   */
  @Get('product-visit/stats')
  @SkipThrottle()
  getStats(@Query('productId') productId?: string) {
    return this.analyticsService.getStats(productId);
  }
}
