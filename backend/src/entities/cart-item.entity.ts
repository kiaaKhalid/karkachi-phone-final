import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Cart } from './cart.entity.js';
import { Product } from './product.entity.js';

/**
 * A single product line inside a shopping cart.
 * A (cartId, productId) pair must be unique so we always INCREMENT quantity
 * rather than create duplicate rows.
 */
@Entity('cart_items')
@Unique(['cartId', 'productId'])
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  cartId: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @Index()
  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.cartItems, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'productId' })
  product: Product;

  /**
   * Snapshot of the price at the time the item was added (for display)
   */
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ default: 1 })
  quantity: number;
}
