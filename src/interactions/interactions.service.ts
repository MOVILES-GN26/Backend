import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interaction } from './interaction.entity';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectRepository(Interaction)
    private readonly repo: Repository<Interaction>,
  ) {}

  /** Record a product view. Fire-and-forget. */
  recordView(userId: string | null, productId: string, sellerId: string | null): void {
    const rec = this.repo.create({ user_id: userId ?? null, product_id: productId, seller_id: sellerId ?? null });
    this.repo.save(rec).catch(() => {
      // ignore errors
    });
  }

  recordPurchase(userId: string | null, productId: string, wasFavorited: boolean): void {
    const rec = this.repo.create({ 
      user_id: userId ?? null, 
      product_id: productId,
      is_purchase: true,
      was_favorited: wasFavorited
    });
    this.repo.save(rec).catch(() => {});
  }

  /** Return views count, last viewed timestamp and last user id for a product */
  async getStats(productId: string): Promise<{ views: number; last_viewed: Date | null; last_user_id: string | null }> {
    const stats = await this.repo
      .createQueryBuilder('i')
      .select('COUNT(*)', 'views')
      .addSelect('MAX(i.viewed_at)', 'last_viewed')
      .where('i.product_id = :productId', { productId })
      .getRawOne<{ views: string; last_viewed: Date | null }>();

    const lastUser = await this.repo
      .createQueryBuilder('i')
      .select('i.user_id', 'user_id')
      .where('i.product_id = :productId', { productId })
      .orderBy('i.viewed_at', 'DESC')
      .limit(1)
      .getRawOne<{ user_id: string }>();

    return {
      views: Number(stats?.views ?? 0),
      last_viewed: stats?.last_viewed ?? null,
      last_user_id: lastUser?.user_id ?? null,
    };
  }

  async getPurchaseFromFavoriteStats(): Promise<{ 
    total_purchases: number; 
    purchases_from_favorites: number; 
    percentage: number 
  }> {
    const total = await this.repo.count({ where: { is_purchase: true } });
    const fromFavorites = await this.repo.count({ where: { is_purchase: true, was_favorited: true } });

    return {
      total_purchases: total,
      purchases_from_favorites: fromFavorites,
      percentage: total > 0 ? Math.round((fromFavorites / total) * 100) : 0
    };
  }

  async getTopCategoriesThisWeek(): Promise<{ category: string; purchases: number }[]> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const result = await this.repo.manager.query(`
        SELECT p.category, COUNT(*) as purchases
        FROM interactions i
        JOIN products p ON p.id::text = i.product_id::text
        WHERE i.is_purchase = true
        AND i.viewed_at >= $1
        GROUP BY p.category
        ORDER BY purchases DESC
        LIMIT 3
    `, [oneWeekAgo]);

    return result.map((r: any) => ({
        category: r.category,
        purchases: Number(r.purchases)
    }));
  }
}
