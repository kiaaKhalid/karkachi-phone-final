import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, CartStatus } from '../entities/cart.entity.js';
import { CartItem } from '../entities/cart-item.entity.js';
import { Product } from '../entities/product.entity.js';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  private async getOrCreateActiveCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId, status: CartStatus.ACTIVE },
      relations: { items: { product: { images: true } } },
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId, status: CartStatus.ACTIVE });
      await this.cartRepository.save(cart);
      cart.items = [];
    }

    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateActiveCart(userId);
    
    // Format response to match what the frontend expects
    const formattedItems = cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      product: item.product ? {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.images?.[0]?.url || null,
      } : null,
    }));

    return {
      success: true,
      data: {
        id: cart.id,
        items: formattedItems,
      },
    };
  }

  async syncCart(userId: string, items: { productId: string; quantity: number }[]) {
    const cart = await this.getOrCreateActiveCart(userId);

    for (const item of items) {
      const product = await this.productRepository.findOne({ where: { id: item.productId } });
      if (!product) continue;

      let cartItem = await this.cartItemRepository.findOne({
        where: { cartId: cart.id, productId: item.productId },
      });

      if (cartItem) {
        cartItem.quantity += item.quantity;
      } else {
        cartItem = this.cartItemRepository.create({
          cartId: cart.id,
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });
      }
      await this.cartItemRepository.save(cartItem);
    }

    return { success: true, message: 'Cart synced successfully' };
  }

  async addItem(userId: string, productId: string, quantity: number = 1) {
    if (!productId) throw new BadRequestException('Product ID is required');

    const cart = await this.getOrCreateActiveCart(userId);
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let cartItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        quantity,
        price: product.price,
      });
    }

    await this.cartItemRepository.save(cartItem);
    return { success: true, message: 'Item added to cart' };
  }

  async updateQuantity(userId: string, productId: string, quantity: number) {
    const cart = await this.getOrCreateActiveCart(userId);
    const cartItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId },
    });

    if (!cartItem) {
      throw new NotFoundException('Item not found in cart');
    }

    if (quantity <= 0) {
      await this.cartItemRepository.remove(cartItem);
      return { success: true, message: 'Item removed from cart' };
    }

    cartItem.quantity = quantity;
    await this.cartItemRepository.save(cartItem);
    
    return { success: true, message: 'Quantity updated' };
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.getOrCreateActiveCart(userId);
    const cartItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId },
    });

    if (!cartItem) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.cartItemRepository.remove(cartItem);
    return { success: true, message: 'Item removed from cart' };
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateActiveCart(userId);
    await this.cartItemRepository.delete({ cartId: cart.id });
    
    return { success: true, message: 'Cart cleared' };
  }
}
