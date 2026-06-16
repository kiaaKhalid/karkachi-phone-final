import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  VersionColumn,
} from 'typeorm';
import { User } from './user.entity.js';
import { OrderItem } from './order-item.entity.js';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CARD = 'card',
  COD = 'cod', // Cash on delivery
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index()
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shippingFee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercent: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  discountAmount: number;

  // ─── Payment ──────────────────────────────────────────────────────────────────

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.COD })
  paymentMethod: PaymentMethod;

  @Index()
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  @Column({ nullable: true, length: 255 })
  paymentReference: string;

  // ─── Shipping address (embedded) ─────────────────────────────────────────────

  @Column({ length: 255 })
  shippingName: string;

  @Column({ type: 'text' })
  shippingAddress: string;

  @Column({ length: 100 })
  shippingCity: string;

  @Column({ length: 20, nullable: true })
  shippingZipCode: string;

  @Column({ length: 20 })
  shippingPhone: string;

  // ─── Tracking & notes ────────────────────────────────────────────────────────

  @Column({ nullable: true, length: 100 })
  trackingNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  adminNotes: string;

  @Column({ nullable: true, length: 255 })
  cancelReason: string;

  @Index()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  // ─── Relations ───────────────────────────────────────────────────────────────

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: false })
  items: OrderItem[];
}
