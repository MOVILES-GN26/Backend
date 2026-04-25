import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVisit, ProductVisitSource } from './entities/product-visit.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ProductVisit)
    private readonly visitsRepo: Repository<ProductVisit>,
  ) {}

  async recordVisit(product_id: string, source: ProductVisitSource) {
    const v = this.visitsRepo.create({ product_id, source });
    await this.visitsRepo.save(v);
    return { ok: true };
  }

  async getStats(productId?: string) {
    const qb = this.visitsRepo.createQueryBuilder('v').select('v.source', 'source').addSelect('COUNT(*)', 'count');
    if (productId) {
      qb.where('v.product_id = :productId', { productId });
    }
    qb.groupBy('v.source');
    const rows: { source: string; count: string }[] = await qb.getRawMany();
    const counts = { home: 0, catalog: 0, favorites: 0 } as Record<string, number>;
    let total = 0;
    for (const r of rows) {
      const c = Number(r.count ?? 0);
      counts[r.source] = c;
      total += c;
    }
    const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 10000) / 100);
    return {
      total,
      percentages: {
        home: pct(counts.home),
        catalog: pct(counts.catalog),
        favorites: pct(counts.favorites),
      },
      counts,
    };
  }
}
