import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('interactions')
export class Interaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  user_id: string | null;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  seller_id: string | null;

  @CreateDateColumn()
  viewed_at: Date;

  @Column({ type: 'boolean', nullable: true })
  was_favorited: boolean | null;

  @Column({ type: 'boolean', default: false })
  is_purchase: boolean;
}
