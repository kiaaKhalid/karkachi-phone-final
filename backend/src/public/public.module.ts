import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicController } from './public.controller.js';
import { PublicService } from './public.service.js';
import { Category } from '../entities/category.entity.js';
import { Brand } from '../entities/brand.entity.js';
import { Product } from '../entities/product.entity.js';
import { Review } from '../entities/review.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Brand, Product, Review])],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
