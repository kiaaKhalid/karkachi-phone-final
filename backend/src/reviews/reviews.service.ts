import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity.js';
import { Product } from '../entities/product.entity.js';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  private async updateProductAverageRating(productId: string) {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .where('review.productId = :productId', { productId })
      .andWhere('review.isApproved = :isApproved', { isApproved: true })
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .getRawOne();

    const average = result?.average ? Number.parseFloat(result.average) : 0;
    const count = result?.count ? Number.parseInt(result.count, 10) : 0;

    await this.productRepository.update(productId, {
      rating: average,
      reviewsCount: count,
    });
  }

  async findAllPaginated(page: number = 1, limit: number = 10) {
    const [reviews, total] = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product')
      .orderBy('review.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Map to match the frontend expected structure
    const items = reviews.map(review => ({
      id: review.id,
      userId: review.userId,
      productId: review.productId,
      rating: review.rating,
      comment: review.comment || '',
      isVerified: review.isApproved ? 1 : 0,
      createdAt: review.createdAt.toISOString(),
      userName: review.user?.name || 'Unknown User',
      userImage: review.user?.avatar || null,
      productName: review.product?.name || 'Unknown Product',
    }));

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async setVerificationStatus(id: string, isApproved: boolean) {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.isApproved = isApproved;
    await this.reviewRepository.save(review);
    
    // Recalculate average rating for the product
    await this.updateProductAverageRating(review.productId);
    
    return review;
  }

  async deleteReview(id: string) {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.reviewRepository.remove(review);

    // Recalculate average rating for the product
    await this.updateProductAverageRating(review.productId);

    return { id };
  }
}
