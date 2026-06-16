import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistsService } from './wishlists.service.js';
import { WishlistsController } from './wishlists.controller.js';
import { WishlistItem } from '../entities/wishlist-item.entity.js';
import { Product } from '../entities/product.entity.js';
import { User } from '../entities/user.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([WishlistItem, Product, User])],
  controllers: [WishlistsController],
  providers: [WishlistsService],
  exports: [WishlistsService],
})
export class WishlistsModule {}
