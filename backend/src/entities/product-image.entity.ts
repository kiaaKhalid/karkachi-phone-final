import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity.js';

/**
 * Additional images for a product (gallery).
 * The main image is stored directly on the Product entity.
 */
@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ length: 500 })
  url: string;

  @Column({ nullable: true, length: 255 })
  altText: string;

  /**
   * Display order in the product gallery
   */
  @Column({ default: 0 })
  sortOrder: number;
}
