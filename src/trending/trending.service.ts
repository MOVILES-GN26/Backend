import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategorySearch } from './category-search.entity';

@Injectable()
export class TrendingService {
  constructor(
    @InjectRepository(CategorySearch)
    private readonly repo: Repository<CategorySearch>,
  ) {}

  /** Record a category filter usage. Fire-and-forget — never blocks the caller. */
  recordSearch(category: string): void {
    this.repo.save(this.repo.create({ category })).catch(() => {
      // Non-critical: ignore write failures so the catalog endpoint is unaffected.
    });
  }

  /**
   * Return the top `limit` categories by search count in the last `days` days,
   * ordered by popularity descending.
   */
  async getTrendingCategories(
    limit = 5,
    days = 7,
  ): Promise<{ category: string; count: number }[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await this.repo
      .createQueryBuilder('cs')
      .select('cs.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('cs.searched_at >= :since', { since })
      .groupBy('cs.category')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany<{ category: string; count: string }>();

    return rows.map((r) => ({ category: r.category, count: Number(r.count) }));
  }
}
