import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { PostCondition } from '../common/constants/conditions';
import { User } from '../users/user.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  title: string;

  @Column({ type: 'varchar', length: 200 })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'varchar' })
  building_location: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: PostCondition })
  condition: PostCondition;

  @Column('text', { array: true })
  image_urls: string[];

  @Column({ type: 'uuid' })
  seller_id: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column({ type: 'uuid', nullable: true })
  store_id: string | null;

  @Column({ type: 'boolean', default: false })
  is_sold: boolean;

  @ManyToOne('Store', 'products', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'store_id' })
  store: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToMany('User', 'favorites')
  favoritedBy: any[];
}
