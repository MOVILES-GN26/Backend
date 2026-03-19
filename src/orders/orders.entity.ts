import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';

export type OrderStatus =
  | 'pending'
  | 'payment_uploaded'
  | 'confirmed'
  | 'shipping'
  | 'completed'
  | 'cancelled';

export type DeliveryOption = 'pickup' | 'shipping';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  buyer_id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @Column({ type: 'uuid' })
  seller_id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column({ type: 'uuid' })
  product_id: string;

  @ManyToOne(() => Product, (p) => p.id, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'enum', enum: ['pending', 'payment_uploaded', 'confirmed', 'shipping', 'completed', 'cancelled'], default: 'pending' })
  status: OrderStatus;

  @Column({ type: 'enum', enum: ['pickup', 'shipping'], nullable: true })
  delivery_option: DeliveryOption | null;

  @Column({ type: 'text', nullable: true })
  delivery_details: string | null;

  @Column({ type: 'varchar', nullable: true })
  payment_proof_url: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
