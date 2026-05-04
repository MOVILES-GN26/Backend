import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({ type: 'varchar', length: 50 })
  first_name: string;

  @Column({ type: 'varchar', length: 50 })
  last_name: string;

  @Column({ type: 'varchar', length: 50 })
  major: string;

  @Column({ type: 'varchar', nullable: true })
  avatar_url: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone_number: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  account_number: string | null;

  @Column({ type: 'jsonb', nullable: true, default: () => "'{}'", name: 'viewed_categories' })
  viewed_categories: Record<string, number>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany('Product', 'seller')
  posts: any[];

  @OneToMany('Store', 'owner')
  stores: any[];

  @ManyToMany('Product', 'favoritedBy')
  @JoinTable({ name: 'favorites' })
  favorites: any[];
}
