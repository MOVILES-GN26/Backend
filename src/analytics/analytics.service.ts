import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVisit, ProductVisitSource } from './entities/product-visit.entity';
import { BuyerSellerContact, ContactChannel } from './entities/buyer-seller-contact.entity';
import { Order } from '../orders/orders.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ProductVisit)
    private readonly visitsRepo: Repository<ProductVisit>,
    @InjectRepository(BuyerSellerContact)
    private readonly contactsRepo: Repository<BuyerSellerContact>,
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
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

  /**
   * Log a buyer→seller contact event. Fire-and-forget — analytics writes
   * must never block the user's flow.
   */
  async recordContact(
    buyer_id: string,
    seller_id: string,
    product_id: string,
    channel: ContactChannel = ContactChannel.WHATSAPP,
  ) {
    // Defensive: a seller contacting themselves would skew the stats.
    if (buyer_id === seller_id) return { ok: true, skipped: true };
    const c = this.contactsRepo.create({ buyer_id, seller_id, product_id, channel });
    await this.contactsRepo.save(c);
    return { ok: true };
  }

  /**
   * Business question (Type 3 — dashboard only):
   *
   *   "What percentage of purchases completed in the last N days had at
   *    least one direct contact between buyer and seller prior to the
   *    purchase?"
   *
   * Counts orders that are NOT cancelled (i.e. real purchase intent went
   * through). For each such order in the window, checks whether the same
   * (buyer_id, seller_id) pair had at least one row in
   * `buyer_seller_contacts` with `created_at < orders.created_at`.
   *
   * @param days   Lookback window in days (default 30, max 365).
   */
  async getContactBeforePurchaseStats(days = 30) {
    const lookback = Math.min(Math.max(days, 1), 365);

    const totalOrdersRow = await this.ordersRepo
      .createQueryBuilder('o')
      .select('COUNT(*)', 'count')
      .where(`o.created_at >= NOW() - (:days * INTERVAL '1 day')`, { days: lookback })
      .andWhere(`o.status <> 'cancelled'`)
      .getRawOne<{ count: string }>();

    const ordersWithContactRow = await this.ordersRepo
      .createQueryBuilder('o')
      .select('COUNT(DISTINCT o.id)', 'count')
      .innerJoin(
        'buyer_seller_contacts',
        'c',
        'c.buyer_id = o.buyer_id AND c.seller_id = o.seller_id AND c.created_at < o.created_at',
      )
      .where(`o.created_at >= NOW() - (:days * INTERVAL '1 day')`, { days: lookback })
      .andWhere(`o.status <> 'cancelled'`)
      .getRawOne<{ count: string }>();

    const total_orders = Number(totalOrdersRow?.count ?? 0);
    const orders_with_prior_contact = Number(ordersWithContactRow?.count ?? 0);
    const percentage =
      total_orders === 0
        ? 0
        : Math.round((orders_with_prior_contact / total_orders) * 10000) / 100;

    return {
      window_days: lookback,
      total_orders,
      orders_with_prior_contact,
      percentage,
    };
  }
}
