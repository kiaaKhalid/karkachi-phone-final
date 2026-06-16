import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PromotionType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  FREE_SHIPPING = 'free_shipping',
}

/**
 * Promotional banners, discount codes and special campaigns.
 * The frontend uses `/promotions` to display banner sections.
 */
@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true, length: 500 })
  imageUrl: string;

  @Column({ nullable: true, length: 500 })
  bannerUrl: string;

  /**
   * Optional CTA link on the promotional banner
   */
  @Column({ nullable: true, length: 500 })
  ctaLink: string;

  @Column({ nullable: true, length: 100 })
  ctaLabel: string;

  /**
   * Promo code (null = automatic, no code needed)
   */

  @Column({ nullable: true, unique: true, length: 50 })
  code: string;

  @Column({ type: 'enum', enum: PromotionType, default: PromotionType.PERCENTAGE })
  type: PromotionType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  value: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  minimumOrderAmount: number;

  @Column({ nullable: true })
  maxUses: number;

  @Column({ default: 0 })
  usedCount: number;

  @Column({ nullable: true })
  startsAt: Date;

  @Column({ nullable: true })
  endsAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
