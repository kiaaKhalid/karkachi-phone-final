import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity.js';
import { Product } from './product.entity.js';

/**
 * Product review submitted by a verified buyer.
 * One user can only review a given product once.
 */
@Entity('reviews')
@Unique(['userId', 'productId'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index()
  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  /**
   * Rating from 1 to 5
   */
  @Column({ type: 'smallint' })
  rating: number;

  @Column({ nullable: true, length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  /**
   * Admin can approve/reject reviews before they go public
   */
  @Column({ default: false })
  isApproved: boolean;

  @Column({ default: false })
  isVerifiedPurchase: boolean;

  @Column({ type: 'text', nullable: true })
  adminReply: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
