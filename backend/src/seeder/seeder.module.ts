import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service.js';
import {
  User,
  Category,
  Brand,
  Product,
  ProductImage,
  ProductSpec,
  Order,
  OrderItem,
  Cart,
  CartItem,
  WishlistItem,
  Review,
  ContactMessage,
  Promotion,
} from '../entities/index.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Category,
      Brand,
      Product,
      ProductImage,
      ProductSpec,
      Order,
      OrderItem,
      Cart,
      CartItem,
      WishlistItem,
      Review,
      ContactMessage,
      Promotion,
    ]),
  ],
  providers: [SeederService],
})
export class SeederModule {}
