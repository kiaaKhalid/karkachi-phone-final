import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity.js';

export enum ContactMessageStatus {
  NEW = 'new',
  IN_PROGRESS = 'in-progress',
  RESOLVED = 'resolved',
}

/**
 * Contact form submissions and customer support messages.
 * Optionally linked to an authenticated user.
 */
@Entity('contact_messages')
export class ContactMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Optional link to an authenticated user account
   */
  @Index()
  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.contactMessages, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * Related order ID (if the inquiry is about a specific order)
   */
  @Column({ nullable: true })
  orderId: string;

  @Column({ length: 150 })
  customerName: string;

  @Column({ length: 255 })
  customerEmail: string;

  @Column({ nullable: true, length: 20 })
  customerPhone: string;

  @Column({ length: 255 })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: ContactMessageStatus, default: ContactMessageStatus.NEW })
  status: ContactMessageStatus;

  // ─── Admin response ───────────────────────────────────────────────────────────

  @Column({ type: 'text', nullable: true })
  adminResponse: string;

  @Column({ nullable: true })
  respondedBy: string; // Admin user ID

  @Column({ nullable: true })
  respondedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
