import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'node:stream';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async findAll(page: number, limit: number, status?: OrderStatus) {
    const queryBuilder = this.ordersRepository.createQueryBuilder('order');

    // Always fetch user relation to display user.name / user.email
    queryBuilder.leftJoinAndSelect('order.user', 'user');

    if (status) {
      queryBuilder.where('order.status = :status', { status });
    }

    queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      data: orders,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: { user: true, items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    const { status, version } = updateOrderStatusDto;

    const order = await this.ordersRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Optimistic Concurrency Control Check
    if (order.version !== version) {
      throw new ConflictException(
        'The order has been updated by another user. Please refresh and try again.',
      );
    }

    order.status = status;
    
    // The version will be automatically incremented by TypeORM's @VersionColumn()
    await this.ordersRepository.save(order);

    return order;
  }

  async exportOrdersToPdf(): Promise<PassThrough> {
    const orders = await this.ordersRepository.find({
      relations: { user: true },
      order: { createdAt: 'DESC' },
      take: 100, // Limit export to 100 most recent for performance, or fetch all if needed
    });

    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();

    doc.pipe(stream);

    // Add Header
    doc
      .fontSize(20)
      .text('Karkachi Phone - Orders Export', { align: 'center' })
      .moveDown(2);

    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`).moveDown(2);

    // Add Orders
    orders.forEach((order, index) => {
      const customerName = order.user ? order.user.name : order.shippingName;
      const orderDate = new Date(order.createdAt).toLocaleDateString();
      const orderNumber = `KP-${new Date(order.createdAt).getFullYear()}-${order.id.slice(-4).toUpperCase()}`;

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`${index + 1}. Order ${orderNumber}`)
        .font('Helvetica')
        .text(`Date: ${orderDate}`)
        .text(`Customer: ${customerName}`)
        .text(`Status: ${order.status.toUpperCase()}`)
        .text(`Total: ${order.total} DH`)
        .moveDown(1);
    });

    doc.end();

    return stream;
  }
}
