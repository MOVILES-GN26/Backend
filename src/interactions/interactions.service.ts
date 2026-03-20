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
}
