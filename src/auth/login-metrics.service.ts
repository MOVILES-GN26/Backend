import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginMetric } from './entities/login-metric.entity';

@Injectable()
export class LoginMetricsService {
  constructor(
    @InjectRepository(LoginMetric)
    private readonly loginMetricRepo: Repository<LoginMetric>,
  ) {}

  async record(email: string, loginType: 'NFC' | 'email-password'): Promise<void> {
    let metric = await this.loginMetricRepo.findOne({ where: { email } });

    if (!metric) {
      metric = this.loginMetricRepo.create({
        email,
        nfc_count: 0,
        email_password_count: 0,
      });
    }

    if (loginType === 'NFC') {
      metric.nfc_count += 1;
    } else {
      metric.email_password_count += 1;
    }

    await this.loginMetricRepo.save(metric);
  }
}
