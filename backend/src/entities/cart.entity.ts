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
import { User } from './user.entity.js';
import { CartItem } from './cart-item.entity.js';

export enum CartStatus {
  ACTIVE = 'active',
  ABANDONED = 'abandoned',
  CONVERTED = 'converted', // Cart turned into an order
}

/**
 * One active cart per user (or per guest session).
 * Guest carts are merged into the user cart upon login.
 */
@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.carts, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * For guest sessions (pre-login)
   */
  @Column({ nullable: true, length: 100 })
  sessionId: string;

  @Column({ type: 'enum', enum: CartStatus, default: CartStatus.ACTIVE })
  status: CartStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ─── Relations ───────────────────────────────────────────────────────────────

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true, eager: false })
  items: CartItem[];
}
