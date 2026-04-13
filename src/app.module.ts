import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { StorageModule } from './storage/storage.module';
import { TokenModule } from './token/token.module';
import { HomeModule } from './home/home.module';
import { HealthModule } from './health/health.module';
import { TrendingModule } from './trending/trending.module';
import { User } from './users/user.entity';
import { Product } from './products/product.entity';
import { CategorySearch } from './trending/category-search.entity';
import { Interaction } from './interactions/interaction.entity';
import { InteractionsModule } from './interactions/interactions.module';
import { Order } from './orders/orders.entity';
import { StoreModule } from './store/store.module';
import { Store } from './store/entities/store.entity';
import { OrdersModule } from './orders/orders.module';
import { LoginMetric } from './auth/entities/login-metric.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'andeshub'),
        entities: [User, Product, CategorySearch, Store, Order, Interaction, LoginMetric],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    AuthModule,
    UsersModule,
    OrdersModule,
    ProductsModule,
    StorageModule,
    TokenModule,
    HomeModule,
    HealthModule,
    TrendingModule,
    InteractionsModule,
    StoreModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
