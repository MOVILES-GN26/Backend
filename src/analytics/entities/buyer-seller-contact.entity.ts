import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum ContactChannel {
  WHATSAPP = 'whatsapp',
}

/**
 * Logged every time a buyer initiates a "direct contact" action (e.g. taps
 * the WhatsApp button on a product detail) before completing a purchase.
 *
 * Used by the BQ:
 *   "What % of purchases completed in the last 30 days had at least one
 *    direct contact between buyer and seller prior to the purchase?"
 */
@Entity('buyer_seller_contacts')
@Index('idx_bsc_buyer_seller_created', ['buyer_id', 'seller_id', 'created_at'])
export class BuyerSellerContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  buyer_id: string;

  @Column({ type: 'uuid' })
  seller_id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'enum', enum: ContactChannel, default: ContactChannel.WHATSAPP })
  channel: ContactChannel;

  @CreateDateColumn()
  created_at: Date;
}
