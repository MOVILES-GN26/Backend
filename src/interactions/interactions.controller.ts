import { Controller, Post, Body, UseGuards, Req, Get, Param } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard';
import { InteractionsService } from './interactions.service';
import { RecordInteractionDto } from './dto/record-interaction.dto';

@Controller('interactions')
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  /**
   * Record a view coming from the client. JWT optional — anonymous views allowed.
   * Body: { product_id, seller_id? }
   */
  @Post('view')
  @UseGuards(OptionalJwtGuard)
  recordView(@Body() dto: RecordInteractionDto, @Req() req: any) {
    const userId: string | null = req.user ? req.user.id : null;
    this.interactionsService.recordView(userId, dto.product_id, dto.seller_id ?? null);
    return { ok: true };
  }

  @Post('purchase')
  @UseGuards(OptionalJwtGuard)
  recordPurchase(@Body() dto: RecordInteractionDto, @Req() req: any) {
    const userId: string | null = req.user ? req.user.id : null;
    this.interactionsService.recordPurchase(userId, dto.product_id, dto.was_favorited ?? false);
    return { ok: true };
  }

  /** Return aggregated stats for a product */
  @Get('product/:id/stats')
  @SkipThrottle()
  getProductStats(@Param('id') productId: string) {
    return this.interactionsService.getStats(productId);
  }

  @Get('purchase-from-favorite/stats')
  @SkipThrottle()
  getPurchaseFromFavoriteStats() {
    return this.interactionsService.getPurchaseFromFavoriteStats();
  }

  @Get('top-categories/week')
  @SkipThrottle()
  getTopCategoriesThisWeek() {
    return this.interactionsService.getTopCategoriesThisWeek();
  }
}
