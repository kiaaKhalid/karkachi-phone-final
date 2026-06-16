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
} from 'typeorm';
import { Category } from './category.entity.js';
import { Brand } from './brand.entity.js';
import { ProductSpec } from './product-spec.entity.js';
import { ProductImage } from './product-image.entity.js';
import { OrderItem } from './order-item.entity.js';
import { CartItem } from './cart-item.entity.js';
import { WishlistItem } from './wishlist-item.entity.js';
import { Review } from './review.entity.js';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Index()
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  /**
   * Original price before discount (null = no discount)
   */
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  originalPrice: number;

  @Column({ default: 0 })
  stock: number;

  /**
   * Main image path or URL
   */
  @Column({ nullable: true, length: 500 })
  image: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating: number;

  @Column({ default: 0 })
  reviewsCount: number;

  @Column({ default: 0 })
  views: number;

  @Index()
  @Column({ default: false })
  isNew: boolean;

  @Index()
  @Column({ default: false })
  isBestSeller: boolean;

  @Index()
  @Column({ default: false })
  isActive: boolean;

  // ─── Promotional / Flash deal flags ──────────────────────────────────────────

  @Index()
  @Column({ default: false })
  isFlashDeal: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  flashPrice: number;

  @Column({ nullable: true })
  flashStartsAt: Date;

  @Column({ nullable: true })
  flashEndsAt: Date;

  @Column({ default: false })
  isPromotionalBanner: boolean;

  @Column({ default: false })
  isProductPhare: boolean;

  // ─── Colors Configuration ──────────────────────────────────────────────────
  @Column({ default: false })
  hasColors: boolean;

  @Column({ type: 'json', nullable: true })
  colors: { name: string; hex: string }[];

  // ─── Computed shortcut: discount percentage (stored to avoid recalc) ─────────
  @Column({ type: 'int', nullable: true })
  discount: number;

  // ─── Category & Brand FK ─────────────────────────────────────────────────────

  @Index()
  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => Category, (cat) => cat.products, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Index()
  @Column({ nullable: true })
  brandId: string;

  @ManyToOne(() => Brand, (brand) => brand.products, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ─── Relations ───────────────────────────────────────────────────────────────

  @OneToMany(() => ProductSpec, (spec) => spec.product, { cascade: true, eager: false })
  specs: ProductSpec[];

  @OneToMany(() => ProductImage, (img) => img.product, { cascade: true, eager: false })
  images: ProductImage[];

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];

  @OneToMany(() => CartItem, (item) => item.product)
  cartItems: CartItem[];

  @OneToMany(() => WishlistItem, (item) => item.product)
  wishlistItems: WishlistItem[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];
}
