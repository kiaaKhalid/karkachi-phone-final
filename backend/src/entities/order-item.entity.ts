import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity.js';
import { Product } from './product.entity.js';

/**
 * A single line-item inside an order.
 * Prices are snapshotted at order time so that future price changes
 * don't affect historical order records.
 */
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Index()
  @Column({ nullable: true })
  productId: string;

  @ManyToOne(() => Product, (product) => product.orderItems, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'productId' })
  product: Product;

  /**
   * Snapshot of product name at order time
   */
  @Column({ length: 255 })
  name: string;

  /**
   * Snapshot of product image at order time
   */
  @Column({ nullable: true, length: 500 })
  image: string;

  /**
   * Unit price paid (after any flash/promotion discount)
   */
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @Column()
  quantity: number;

  /**
   * totalPrice = unitPrice * quantity
   */
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalPrice: number;
}
