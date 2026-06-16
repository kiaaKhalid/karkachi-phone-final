import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity.js';
import { Product } from './product.entity.js';

/**
 * Wishlist item — one row per (user, product) pair.
 * Enforcing uniqueness prevents duplicate wishlist entries.
 */
@Entity('wishlist_items')
@Unique(['userId', 'productId'])
export class WishlistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.wishlistItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index()
  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.wishlistItems, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @CreateDateColumn()
  addedAt: Date;
}
