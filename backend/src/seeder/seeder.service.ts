import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  User,
  Category,
  Brand,
  Product,
  ProductImage,
  ProductSpec,
  Order,
  OrderItem,
  Cart,
  CartItem,
  WishlistItem,
  Review,
  ContactMessage,
  Promotion,
  UserRole,
  AuthProvider,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../entities/index.js';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand) private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage) private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(ProductSpec) private readonly productSpecRepository: Repository<ProductSpec>,
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem) private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(WishlistItem) private readonly wishlistRepository: Repository<WishlistItem>,
    @InjectRepository(Review) private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ContactMessage) private readonly contactMessageRepository: Repository<ContactMessage>,
    @InjectRepository(Promotion) private readonly promotionRepository: Repository<Promotion>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const isSeedRequested = this.configService.get('SEED_DB') === 'true';
    const usersCount = await this.userRepository.count();

    if (isSeedRequested || usersCount === 0) {
      this.logger.log('🌱 Démarrage du Seeding Complet (14 Entités)...');
      
      const { client1, client2 } = await this.seedUsers();
      await this.seedCategoriesAndBrands();
      const products = await this.seedProducts();
      await this.seedProductDetails(products);
      await this.seedPromotions();
      await this.seedReviewsAndWishlist(client1, client2, products);
      await this.seedCartsAndOrders(client1, client2, products);
      await this.seedContactMessages(client1);

      this.logger.log('✅ Seeding Complet terminé avec succès.');
    } else {
      this.logger.log('⏭️  Seeding ignoré (Base de données déjà peuplée).');
    }
  }

  private async seedUsers() {
    const salt = await bcrypt.genSalt(10);
    const passwordAdmin = await bcrypt.hash('admin123', salt);
    const passwordClient = await bcrypt.hash('client123', salt);

    let admin = await this.userRepository.findOne({ where: { email: 'admin@shop.com' } });
    if (!admin) {
      admin = this.userRepository.create({
        email: 'admin@shop.com',
        password: passwordAdmin,
        name: 'Administrateur',
        role: UserRole.ADMIN,
        authProvider: AuthProvider.LOCAL,
        isEmailVerified: true,
        isActive: true,
      });
      await this.userRepository.save(admin);
    }

    let client1 = await this.userRepository.findOne({ where: { email: 'client1@shop.com' } });
    if (!client1) {
      client1 = this.userRepository.create({
        email: 'client1@shop.com',
        password: passwordClient,
        name: 'Jean Dupont',
        role: UserRole.USER,
        authProvider: AuthProvider.LOCAL,
        isEmailVerified: true,
        isActive: true,
        phone: '+33600000001',
      });
      await this.userRepository.save(client1);
    }

    let client2 = await this.userRepository.findOne({ where: { email: 'client2@shop.com' } });
    if (!client2) {
      client2 = this.userRepository.create({
        email: 'client2@shop.com',
        password: passwordClient,
        name: 'Marie Martin',
        role: UserRole.USER,
        authProvider: AuthProvider.LOCAL,
        isEmailVerified: true,
        isActive: true,
        phone: '+33600000002',
      });
      await this.userRepository.save(client2);
    }

    this.logger.log('👤 Utilisateurs créés (Admin + 2 Clients)');
    return { admin, client1, client2 };
  }

  private async seedCategoriesAndBrands() {
    if ((await this.categoryRepository.count()) === 0) {
      const categories = [
        { name: 'Électronique', slug: 'electronique', isActive: true, image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80' },
        { name: 'Vêtements', slug: 'vetements', isActive: true, image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80' },
        { name: 'Maison', slug: 'maison', isActive: true, image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&q=80' },
        { name: 'Beauté', slug: 'beaute', isActive: true, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80' },
      ];
      await this.categoryRepository.save(this.categoryRepository.create(categories));
    }

    if ((await this.brandRepository.count()) === 0) {
      const brands = [
        { name: 'Apple', slug: 'apple', isActive: true },
        { name: 'Samsung', slug: 'samsung', isActive: true },
        { name: 'Nike', slug: 'nike', isActive: true },
        { name: 'Sony', slug: 'sony', isActive: true },
      ];
      await this.brandRepository.save(this.brandRepository.create(brands));
    }
    this.logger.log('📂 Catégories et Marques créées');
  }

  private async seedProducts() {
    let products = await this.productRepository.find({ relations: { category: true, brand: true } });
    if (products.length > 0) return products;

    const categories = await this.categoryRepository.find();
    const brands = await this.brandRepository.find();

    const techCategory = categories.find(c => c.slug === 'electronique');
    const fashionCategory = categories.find(c => c.slug === 'vetements');

    const appleBrand = brands.find(b => b.slug === 'apple');
    const samsungBrand = brands.find(b => b.slug === 'samsung');
    const nikeBrand = brands.find(b => b.slug === 'nike');

    const rawProducts = [
      {
        name: 'iPhone 15 Pro Max',
        description: 'Le dernier smartphone d\'Apple.',
        price: 1199,
        originalPrice: 1499,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80',
        rating: 4.8,
        reviewsCount: 125,
        isActive: true,
        isFlashDeal: true,
        flashPrice: 1199,
        flashStartsAt: new Date(Date.now() - 3600000),
        flashEndsAt: new Date(Date.now() + 86400000),
        discount: 20,
        isBestSeller: true,
        category: techCategory,
        brand: appleBrand,
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Smartphone propulsé par Galaxy AI.',
        price: 1099,
        originalPrice: 1399,
        stock: 45,
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=80',
        rating: 4.7,
        reviewsCount: 89,
        isActive: true,
        isFlashDeal: true,
        flashPrice: 1099,
        flashStartsAt: new Date(Date.now() - 3600000),
        flashEndsAt: new Date(Date.now() + 86400000),
        discount: 21,
        category: techCategory,
        brand: samsungBrand,
      },
      {
        name: 'MacBook Pro M3 Max 16"',
        description: 'L\'ordinateur portable le plus puissant avec la puce M3 Max.',
        price: 3499,
        stock: 15,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80',
        rating: 4.9,
        reviewsCount: 42,
        isActive: true,
        isBestSeller: true,
        isNew: true,
        category: techCategory,
        brand: appleBrand,
      },
      {
        name: 'Nike Air Max 270',
        description: 'Chaussures de running confortables pour un usage quotidien.',
        price: 150,
        stock: 120,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
        rating: 4.5,
        reviewsCount: 310,
        isActive: true,
        isBestSeller: true,
        category: fashionCategory,
        brand: nikeBrand,
      }
    ];

    products = await this.productRepository.save(this.productRepository.create(rawProducts));
    this.logger.log('📦 Produits créés');
    return products;
  }

  private async seedProductDetails(products: Product[]) {
    if ((await this.productImageRepository.count()) === 0) {
      const iphone = products.find(p => p.name.includes('iPhone'));
      if (iphone) {
        await this.productImageRepository.save(
          this.productImageRepository.create([
            { product: iphone, url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80', sortOrder: 1 },
            { product: iphone, url: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500&q=80', sortOrder: 2 },
          ])
        );

        await this.productSpecRepository.save(
          this.productSpecRepository.create([
            { product: iphone, key: 'Stockage', value: '256GB' },
            { product: iphone, key: 'Couleur', value: 'Titane Naturel' },
            { product: iphone, key: 'Ecran', value: '6.7 pouces' },
          ])
        );
      }
      this.logger.log('📸 Images secondaires et Specs de produits créées');
    }
  }

  private async seedPromotions() {
    if ((await this.promotionRepository.count()) === 0) {
      await this.promotionRepository.save(
        this.promotionRepository.create({
          title: 'Bienvenue 20%',
          code: 'WELCOME20',
          description: '20% de réduction sur la première commande',
          value: 20,
          isActive: true,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 30 * 86400000), // Valid for 30 days
        })
      );
      this.logger.log('🎁 Promotions créées');
    }
  }

  private async seedReviewsAndWishlist(client1: User, client2: User, products: Product[]) {
    if (products.length === 0) return;
    const iphone = products.find(p => p.name.includes('iPhone'));
    const nike = products.find(p => p.name.includes('Nike'));

    if ((await this.reviewRepository.count()) === 0) {
      if (iphone) {
        await this.reviewRepository.save(
          this.reviewRepository.create({
            user: client1,
            product: iphone,
            rating: 5,
            comment: 'Le meilleur téléphone que j\'ai jamais eu !',
          })
        );
      }
      this.logger.log('⭐ Avis créés');
    }

    if ((await this.wishlistRepository.count()) === 0) {
      if (nike) {
        await this.wishlistRepository.save(
          this.wishlistRepository.create({
            user: client2,
            product: nike,
          })
        );
      }
      this.logger.log('❤️ Listes de souhaits créées');
    }
  }

  private async seedCartsAndOrders(client1: User, client2: User, products: Product[]) {
    if (products.length === 0) return;
    const macbook = products.find(p => p.name.includes('MacBook'));
    const iphone = products.find(p => p.name.includes('iPhone'));

    if ((await this.cartRepository.count()) === 0 && macbook) {
      const cart = await this.cartRepository.save(this.cartRepository.create({ user: client1 }));
      await this.cartItemRepository.save(
        this.cartItemRepository.create({
          cart: cart,
          product: macbook,
          quantity: 1,
          price: macbook.price,
        })
      );
      this.logger.log('🛒 Panier actif créé');
    }

    if ((await this.orderRepository.count()) === 0 && iphone) {
      const order = await this.orderRepository.save(
        this.orderRepository.create({
          user: client2,
          total: iphone.price,
          status: OrderStatus.DELIVERED,
          paymentStatus: PaymentStatus.PAID,
          paymentMethod: PaymentMethod.CARD,
          shippingName: 'Marie Martin',
          shippingAddress: '123 Rue de la Paix',
          shippingCity: 'Paris',
          shippingPhone: '+33600000002',
          trackingNumber: 'TRK987654321',
        })
      );
      
      await this.orderItemRepository.save(
        this.orderItemRepository.create({
          order: order,
          product: iphone,
          name: iphone.name,
          image: iphone.image,
          quantity: 1,
          unitPrice: iphone.price,
          totalPrice: iphone.price,
        })
      );
      this.logger.log('🚚 Commandes historiques créées');
    }
  }

  private async seedContactMessages(client: User) {
    if ((await this.contactMessageRepository.count()) === 0) {
      await this.contactMessageRepository.save(
        this.contactMessageRepository.create({
          customerName: client.name,
          customerEmail: client.email,
          subject: 'Question sur le suivi de livraison',
          message: 'Bonjour, je voudrais savoir quand ma commande arrivera. Merci.',
        })
      );
      this.logger.log('✉️ Messages de contact créés');
    }
  }
}
