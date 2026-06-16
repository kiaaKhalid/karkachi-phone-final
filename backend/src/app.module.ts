import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Entities
import {
  User,
  Product,
  Category,
  Brand,
  ProductSpec,
  ProductImage,
  Order,
  OrderItem,
  Cart,
  CartItem,
  WishlistItem,
  Review,
  ContactMessage,
  Promotion,
} from './entities/index.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { SeederModule } from './seeder/seeder.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { UploadModule } from './upload/upload.module.js';
import { BrandsModule } from './brands/brands.module.js';
import { ProductsModule } from './products/products.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { PublicModule } from './public/public.module.js';
import { WishlistsModule } from './wishlists/wishlists.module.js';
import { CartsModule } from './carts/carts.module.js';
import { PromotionsModule } from './promotions/promotions.module.js';
import { DeliveryRulesModule } from './delivery-rules/delivery-rules.module.js';

const ALL_ENTITIES = [
  User,
  Product,
  Category,
  Brand,
  ProductSpec,
  ProductImage,
  Order,
  OrderItem,
  Cart,
  CartItem,
  WishlistItem,
  Review,
  ContactMessage,
  Promotion,
];

@Module({
  imports: [
    // ── Environment configuration ─────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      // Load .env.production when NODE_ENV=production, else .env
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env',
      ],
    }),

    // ── Database (MySQL via TypeORM) ──────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get<string>('NODE_ENV') === 'production';
        const databaseUrl = config.get<string>('DATABASE_URL');

        // ── Production: Use DATABASE_URL if available ─────────────────────────
        if (isProd && databaseUrl) {
          return {
            type: 'mysql',
            url: databaseUrl,
            entities: ALL_ENTITIES,
            // Allow forced sync in production using DB_SYNC var
            synchronize: process.env.DB_SYNC === 'true' || false,
            logging: false,
            // Heroku Postgres requires SSL
            ssl: { rejectUnauthorized: false },
            extra: {
              ssl: { rejectUnauthorized: false },
            },
          };
        }

        // ── Development: use individual DB_* env vars ─────────────────────────
        return {
          type: 'mysql',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 3306),
          username: config.get<string>('DB_USER', 'root'),
          password: config.get<string>('DB_PASSWORD', ''),
          database: config.get<string>('DB_NAME', 'karkachi_phone'),
          entities: ALL_ENTITIES,
          synchronize: true,
          logging: true,
        };
      },
    }),

    // ── Feature Modules ───────────────────────────────────────────────────────
    UsersModule,
    AuthModule,
    SeederModule,
    CategoriesModule,
    UploadModule,
    BrandsModule,
    ProductsModule,
    OrdersModule,
    AnalyticsModule,
    ReviewsModule,
    DashboardModule,
    PublicModule,
    WishlistsModule,
    CartsModule,
    PromotionsModule,
    DeliveryRulesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
