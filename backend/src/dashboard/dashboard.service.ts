import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity.js';
import { User, UserRole } from '../entities/user.entity.js';
import { Product } from '../entities/product.entity.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getStaticStats() {
    // 1. Calculate Total Revenue (only from successful orders, excluding cancelled)
    const revenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.status != :cancelledStatus', { cancelledStatus: OrderStatus.CANCELLED })
      .select('SUM(order.total)', 'total')
      .getRawOne();
    
    const revenue = Number.parseFloat(revenueResult?.total || '0');

    // 2. Calculate Total Orders
    const ordersCount = await this.orderRepository.count();

    // 3. Calculate Total Active Products
    const productsCount = await this.productRepository.count({
      where: { isActive: true },
    });

    // 4. Calculate Total Clients (Users with role USER)
    const clientsCount = await this.userRepository.count({
      where: { role: UserRole.USER },
    });

    return {
      revenue,
      orders: ordersCount,
      products: productsCount,
      clients: clientsCount,
    };
  }

  async getRecentOrders() {
    // Get the 5 most recent orders with user details
    const recentOrders = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .orderBy('order.createdAt', 'DESC')
      .take(5)
      .getMany();

    // Map to match the frontend DashboardOrder interface
    return recentOrders.map(order => ({
      id: order.id,
      userId: order.user?.id,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
      user: {
        email: order.user?.email || 'Unknown',
        name: order.user?.name || 'Unknown User',
      },
    }));
  }
}
