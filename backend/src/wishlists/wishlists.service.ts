import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from '../entities/wishlist-item.entity.js';
import { Product } from '../entities/product.entity.js';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly wishlistRepository: Repository<WishlistItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getUserWishlist(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.wishlistRepository.findAndCount({
      where: { userId },
      relations: { product: { images: true } },
      skip,
      take: limit,
      order: { addedAt: 'DESC' },
    });

    const formattedItems = items.map((item) => {
      const p = item.product;
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        priceOriginal: p.originalPrice,
        image: p.images?.[0]?.url || null,
        stock: p.stock,
        isAvailable: p.stock > 0,
        addedAt: item.addedAt,
      };
    });

    return {
      success: true,
      data: {
        items: formattedItems,
        total,
        page,
        limit,
      },
    };
  }

  async addToWishlist(userId: string, productId: string) {
    if (!productId) {
      throw new BadRequestException('Product ID is required');
    }

    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });

    if (existing) {
      // Already in wishlist
      return { success: true, message: 'Already in wishlist' };
    }

    const wishlistItem = this.wishlistRepository.create({
      userId,
      productId,
    });

    await this.wishlistRepository.save(wishlistItem);
    return { success: true, message: 'Added to wishlist' };
  }

  async removeFromWishlist(userId: string, productId: string) {
    const existing = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });

    if (!existing) {
      throw new NotFoundException('Item not found in wishlist');
    }

    await this.wishlistRepository.remove(existing);
    return { success: true, message: 'Removed from wishlist' };
  }

  async clearWishlist(userId: string) {
    await this.wishlistRepository.delete({ userId });
    return { success: true, message: 'Wishlist cleared' };
  }
}
