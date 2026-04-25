import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ProductVisitSource {
  HOME = 'home',
  CATALOG = 'catalog',
  FAVORITES = 'favorites',
}

@Entity('product_visits')
export class ProductVisit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'enum', enum: ProductVisitSource })
  source: ProductVisitSource;

  @CreateDateColumn()
  created_at: Date;
}
