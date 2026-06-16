import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Product } from './product.entity.js';

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;


  @Column({ unique: true, length: 150 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  /**
   * Brand logo URL / path
   */
  @Column({ nullable: true, length: 500 })
  logo: string;

  /**
   * Country of origin (e.g. "Corée du Sud")
   */
  @Column({ nullable: true, length: 100 })
  country: string;

  @Column({ nullable: true, length: 255 })
  website: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ─── Relations ───────────────────────────────────────────────────────────────

  @OneToMany(() => Product, (product) => product.brand)
  products: Product[];
}
