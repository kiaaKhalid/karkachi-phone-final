import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity.js';
import { User, UserRole } from '../entities/user.entity.js';
import { Product } from '../entities/product.entity.js';
import { OrderItem } from '../entities/order-item.entity.js';

export enum AnalyticsPeriod {
  LAST_7_DAYS = 'last7days',
  LAST_30_DAYS = 'last30days',
  LAST_90_DAYS = 'last90days',
  LAST_YEAR = 'lastYear',
}

interface DateRange {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  private getDateRange(period: string): DateRange {
    const end = new Date();
    const start = new Date();
    
    let days: number;
    switch (period) {
      case AnalyticsPeriod.LAST_7_DAYS:
        days = 7;
        break;
      case AnalyticsPeriod.LAST_30_DAYS:
        days = 30;
        break;
      case AnalyticsPeriod.LAST_90_DAYS:
        days = 90;
        break;
      case AnalyticsPeriod.LAST_YEAR:
        days = 365;
        break;
      default:
        days = 30;
    }

    start.setDate(end.getDate() - days);

    const previousEnd = new Date(start);
    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - days);

    return { start, end, previousStart, previousEnd };
  }

  async getStaticData(period: string) {
    const { start, end, previousStart, previousEnd } = this.getDateRange(period);

    // Current period revenue
    const currentRevenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total')
      .where('order.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere('order.status != :status', { status: OrderStatus.CANCELLED })
      .getRawOne();
      
    const currentRevenue = Number.parseFloat(currentRevenueResult?.total || '0');

    // Previous period revenue
    const previousRevenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total')
      .where('order.createdAt BETWEEN :start AND :end', { start: previousStart, end: previousEnd })
      .andWhere('order.status != :status', { status: OrderStatus.CANCELLED })
      .getRawOne();
      
    const previousRevenue = Number.parseFloat(previousRevenueResult?.total || '0');

    // Growth calculation
    let growth = 0;
    if (previousRevenue === 0) {
      growth = currentRevenue > 0 ? 100 : 0;
    } else {
      growth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    }

    // Orders in current period
    const ordersCount = await this.orderRepository.count({
      where: { createdAt: Between(start, end) }
    });

    // Total customers (users with role USER)
    const totalCustomers = await this.userRepository.count({
      where: { role: UserRole.USER }
    });

    // New customers in current period
    const newCustomers = await this.userRepository.count({
      where: {
        role: UserRole.USER,
        createdAt: Between(start, end)
      }
    });

    // Active products
    const activeProductsCount = await this.productRepository.count({
      where: { isActive: true }
    });

    return {
      period,
      revenue: {
        amount: currentRevenue,
        growth: growth,
      },
      orders: ordersCount,
      customers: {
        total: totalCustomers,
        new: newCustomers,
      },
      products: activeProductsCount,
      range: {
        from: start.toISOString(),
        to: end.toISOString(),
      }
    };
  }

  async getGraphData(period: string) {
    const { start, end } = this.getDateRange(period);

    // Revenue Trends (Group by day)
    // Use DATE() function which works in most SQL databases including Postgres and MySQL/SQLite
    const revenueTrendsRaw = await this.orderRepository
      .createQueryBuilder('order')
      .select('DATE(order.createdAt)', 'day')
      .addSelect('SUM(order.total)', 'amount')
      .where('order.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere('order.status != :status', { status: OrderStatus.CANCELLED })
      .groupBy('DATE(order.createdAt)')
      .orderBy('day', 'ASC')
      .getRawMany();

    const revenueTrends = revenueTrendsRaw.map(r => ({
      day: r.day,
      amount: Number.parseFloat(r.amount || '0'),
    }));

    // Top Selling Products
    const topSellingProductsRaw = await this.orderItemRepository
      .createQueryBuilder('item')
      .select('item.productId', 'id')
      .addSelect('item.name', 'name')
      .addSelect('SUM(item.quantity)', 'quantity')
      .leftJoin('item.order', 'order')
      .where('order.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere('order.status != :status', { status: OrderStatus.CANCELLED })
      .groupBy('item.productId, item.name')
      .orderBy('quantity', 'DESC')
      .limit(5)
      .getRawMany();

    const topSellingProducts = topSellingProductsRaw.map(r => ({
      id: r.id,
      name: r.name,
      quantity: Number.parseInt(r.quantity, 10) || 0,
    }));

    // Order Status Distribution
    const orderStatusRaw = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .where('order.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('order.status')
      .getRawMany();

    const orderStatusDistribution = orderStatusRaw.map(r => ({
      status: r.status,
      count: Number.parseInt(r.count, 10) || 0,
    }));

    return {
      period,
      revenueTrends,
      topSellingProducts,
      customerDemographics: [], // Not implemented in frontend designs
      orderStatusDistribution,
      range: {
        from: start.toISOString(),
        to: end.toISOString(),
      }
    };
  }
}
