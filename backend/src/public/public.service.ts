import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity.js';
import { Brand } from '../entities/brand.entity.js';
import { Product } from '../entities/product.entity.js';
import { Review } from '../entities/review.entity.js';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async getProducts(query: any) {
    const { skip = 0, limit = 15, categoryId, brandId, priceMin, priceMax, q } = query;

    const qb = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('product.isActive = :isActive', { isActive: true });

    if (categoryId && categoryId !== 'all') {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (brandId && brandId !== 'all') {
      qb.andWhere('product.brandId = :brandId', { brandId });
    }

    if (priceMin !== undefined && priceMin !== '') {
      qb.andWhere('product.price >= :priceMin', { priceMin: Number(priceMin) });
    }

    if (priceMax !== undefined && priceMax !== '') {
      qb.andWhere('product.price <= :priceMax', { priceMax: Number(priceMax) });
    }

    if (q && q.trim() !== '') {
      qb.andWhere('(LOWER(product.name) LIKE LOWER(:q) OR LOWER(product.description) LIKE LOWER(:q))', { q: `%${q.trim()}%` });
    }

    qb.orderBy('product.createdAt', 'DESC')
      .skip(Number(skip))
      .take(Number(limit));

    const [items, total] = await qb.getManyAndCount();

    return { items, total };
  }

  async getProductById(id: string) {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
      relations: {
        images: true,
        category: true,
        brand: true,
        specs: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product not found`);
    }

    await this.productRepository.increment({ id }, 'views', 1);
    product.views = (product.views || 0) + 1;

    return product;
  }

  async getBrandsLogo() {
    const brands = await this.brandRepository
      .createQueryBuilder('brand')
      .where('brand.isActive = :isActive', { isActive: true })
      .take(15)
      .getMany();
    
    return brands.map(b => ({
      id: b.id,
      name: b.name,
      logoUrl: b.logo,
    }));
  }

  async getCategories() {
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
    
    return categories.map(c => ({
      id: c.id,
      name: c.name,
    }));
  }

  async getBestSellers() {
    return this.productRepository.find({
      where: { isBestSeller: true, isActive: true },
      relations: {
        images: true,
        category: true,
        brand: true,
      },
      order: { createdAt: 'DESC' },
      take: 9,
    });
  }

  async getRecommendedProducts() {
    // For now, let's just return products marked as isNew or just random active ones
    return this.productRepository.find({
      where: { isNew: true, isActive: true },
      relations: {
        images: true,
        category: true,
        brand: true,
      },
      order: { createdAt: 'DESC' },
      take: 9,
    });
  }

  async getFlashDeals() {
    return this.productRepository.find({
      where: { isFlashDeal: true, isActive: true },
      relations: {
        images: true,
        category: true,
        brand: true,
      },
      order: { flashEndsAt: 'ASC', createdAt: 'DESC' },
      take: 8,
    });
  }

  async getDealsPaginated(query: any) {
    const { skip = 0, limit = 15 } = query;

    const qb = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('product.isFlashDeal = :isFlashDeal', { isFlashDeal: true })
      .orderBy('product.flashEndsAt', 'ASC')
      .addOrderBy('product.createdAt', 'DESC')
      .skip(Number(skip))
      .take(Number(limit));

    const [items, total] = await qb.getManyAndCount();

    return { items, total };
  }

  async getReviewsByProductId(productId: string, query: any) {
    const { page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.productId = :productId', { productId })
      .andWhere('review.isApproved = :isApproved', { isApproved: true })
      .orderBy('review.createdAt', 'DESC')
      .skip(skip)
      .take(Number(limit))
      .getManyAndCount();

    const items = reviews.map(review => ({
      id: review.id,
      userName: review.user?.name || 'Unknown User',
      userImage: review.user?.avatar || null,
      comment: review.comment || '',
      rating: review.rating,
      createdAt: review.createdAt.toISOString(),
      isMine: false, // For public view, we don't know who is logged in here
    }));

    return { items, total };
  }
}
