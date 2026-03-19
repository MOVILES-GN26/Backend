import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'uuid' })
  owner_id: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => User, (user) => user.stores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany('Product', 'store')
  products: any[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'varchar', nullable: true })
  logo_url: string | null;
}
