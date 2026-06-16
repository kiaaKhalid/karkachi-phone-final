import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  VersionColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity.js';
import { Cart } from './cart.entity.js';
import { WishlistItem } from './wishlist-item.entity.js';
import { Review } from './review.entity.js';
import { ContactMessage } from './contact-message.entity.js';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  LIVREUR = 'livreur',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;


  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Index()
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.LOCAL })
  authProvider: AuthProvider;

  @Column({ nullable: true, length: 500 })
  avatar: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ nullable: true, type: 'text' })
  address: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Index()
  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLogin: Date;

  @Column({ nullable: true, select: false })
  refreshToken: string;

  @Column({ nullable: true, select: false })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetExpires: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  // ─── Relations ───────────────────────────────────────────────────────────────

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @OneToMany(() => WishlistItem, (wishlist) => wishlist.user)
  wishlistItems: WishlistItem[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => ContactMessage, (msg) => msg.user)
  contactMessages: ContactMessage[];
}
