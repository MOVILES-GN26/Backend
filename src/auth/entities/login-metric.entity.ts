import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('login_metrics')
export class LoginMetric {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'int', default: 0 })
  nfc_count: number;

  @Column({ type: 'int', default: 0 })
  email_password_count: number;
}
