import { Controller, Post, Body, UseGuards, Req, Get, Query } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { ProductVisitDto } from './dto/product-visit.dto';
import { RecordContactDto } from './dto/record-contact.dto';

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

  /**
   * Record a buyer→seller direct-contact event (e.g. tapped the WhatsApp
   * button). JWT required: we need the buyer's id to later correlate with
   * orders. Returns immediately — the insert is fire-and-forget.
   */
  @Post('contact')
  @UseGuards(JwtAuthGuard)
  recordContact(@Body() dto: RecordContactDto, @Req() req: any) {
    const buyerId: string = req.user.id;
    return this.analyticsService.recordContact(
      buyerId,
      dto.seller_id,
      dto.product_id,
      dto.channel,
    );
  }

  /**
   * BQ Type 3 — for the dashboard:
   *   "% of purchases completed in the last N days that had at least one
   *    direct contact between buyer and seller prior to the purchase."
   *
   * Query: `?days=30` (default 30, clamped to [1, 365]).
   */
  @Get('contact-before-purchase')
  @SkipThrottle()
  getContactBeforePurchase(@Query('days') daysQ?: string) {
    const days = daysQ ? parseInt(daysQ, 10) || 30 : 30;
    return this.analyticsService.getContactBeforePurchaseStats(days);
  }
}
