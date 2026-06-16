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
 * Technical specifications of a product (key/value pairs)
 * e.g. { key: "RAM", value: "8 Go" }
 */
@Entity('product_specs')
export class ProductSpec {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.specs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ length: 100 })
  key: string;

  @Column({ length: 255 })
  value: string;

  /**
   * Display order within a product's spec list
   */
  @Column({ default: 0 })
  sortOrder: number;
}
