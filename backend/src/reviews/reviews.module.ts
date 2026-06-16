import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from '../entities/review.entity.js';
import { Product } from '../entities/product.entity.js';
import { ReviewsService } from './reviews.service.js';
import { AdminReviewsController } from './admin-reviews.controller.js';
import { SuperAdminReviewsController } from './super-admin-reviews.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Product])],
  controllers: [AdminReviewsController, SuperAdminReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
