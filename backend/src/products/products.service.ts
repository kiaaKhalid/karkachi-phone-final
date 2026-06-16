import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Product, ProductImage, ProductSpec } from '../entities/index.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { UploadService } from '../upload/upload.service.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(ProductSpec)
    private readonly productSpecRepository: Repository<ProductSpec>,
    private readonly uploadService: UploadService,
    private readonly dataSource: DataSource,
  ) {}

  private calculateDiscount(price: number, originalPrice?: number): number | undefined {
    if (!originalPrice || originalPrice <= price) return undefined;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  async findAll(page: number = 1, limit: number = 20, options?: any) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .skip(skip)
      .take(limit)
      .orderBy('product.createdAt', 'DESC');

    // Add filters if any
    if (options?.categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId: options.categoryId });
    }
    if (options?.brandId) {
      queryBuilder.andWhere('product.brandId = :brandId', { brandId: options.brandId });
    }
    if (options?.search) {
      queryBuilder.andWhere('product.name LIKE :search', { search: `%${options.search}%` });
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        category: true,
        brand: true,
        images: true,
        specs: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    return this.dataSource.transaction(async (manager) => {
      const discount = this.calculateDiscount(createProductDto.price, createProductDto.originalPrice);

      const product = manager.create(Product, {
        ...createProductDto,
        discount,
        images: undefined,
        specs: undefined,
      });

      const savedProduct = await manager.save(Product, product);

      if (createProductDto.images && createProductDto.images.length > 0) {
        const productImages = createProductDto.images.map((img) =>
          manager.create(ProductImage, {
            productId: savedProduct.id,
            url: img.url,
            altText: img.altText,
            sortOrder: img.sortOrder || 0,
          }),
        );
        await manager.save(ProductImage, productImages);
        savedProduct.images = productImages;
      }

      if (createProductDto.specs && createProductDto.specs.length > 0) {
        const productSpecs = createProductDto.specs.map((spec) =>
          manager.create(ProductSpec, {
            productId: savedProduct.id,
            key: spec.key,
            value: spec.value,
            sortOrder: spec.sortOrder || 0,
          }),
        );
        await manager.save(ProductSpec, productSpecs);
        savedProduct.specs = productSpecs;
      }

      return savedProduct;
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        images: true,
        specs: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const oldMainImage = product.image;
    const oldGalleryImages = product.images || [];

    // Begin Transaction
    return this.dataSource.transaction(async (manager) => {
      // 1. Update basic fields
      const price = updateProductDto.price ?? product.price;
      const originalPrice = updateProductDto.originalPrice ?? product.originalPrice;
      const discount = this.calculateDiscount(price, originalPrice);

      const updatedProductData = {
        ...updateProductDto,
        discount,
      };

      // Don't update relations via Object.assign, delete them to handle manually
      delete updatedProductData.images;
      delete updatedProductData.specs;

      Object.assign(product, updatedProductData);
      await manager.save(Product, product);

      // 2. Handle Gallery Images Update
      if (updateProductDto.images) {
        await this.handleImagesUpdate(manager, id, updateProductDto.images, oldGalleryImages);
      }

      // 3. Handle Main Image Delete (if replaced)
      if (updateProductDto.image !== undefined && oldMainImage && updateProductDto.image !== oldMainImage) {
        await this.uploadService.deleteImage(oldMainImage);
      }

      // 4. Handle Specs Update
      if (updateProductDto.specs) {
        await this.handleSpecsUpdate(manager, id, updateProductDto.specs);
      }

      return this.findOne(id);
    });
  }

  async activate(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    product.isActive = true;
    return this.productRepository.save(product);
  }

  async deactivate(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    product.isActive = false;
    return this.productRepository.save(product);
  }

  async remove(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const mainImage = product.image;
    const galleryImages = product.images || [];

    await this.productRepository.remove(product);

    // Clean up images from Cloudinary after DB delete
    if (mainImage) {
      await this.uploadService.deleteImage(mainImage);
    }
    for (const img of galleryImages) {
      await this.uploadService.deleteImage(img.url);
    }

    return { deleted: true };
  }

  private async handleImagesUpdate(manager: EntityManager, id: string, newImages: any[], oldGalleryImages: ProductImage[]) {
    const newImageUrls = new Set(newImages.map(i => i.url));

    const imagesToDelete = oldGalleryImages.filter(oldImg => !newImageUrls.has(oldImg.url));
    if (imagesToDelete.length > 0) {
      await manager.remove(ProductImage, imagesToDelete);
      for (const img of imagesToDelete) {
        await this.uploadService.deleteImage(img.url);
      }
    }

    const currentImagesInDb = await manager.find(ProductImage, { where: { productId: id } });
    
    for (const img of newImages) {
      const existingImage = currentImagesInDb.find(e => e.url === img.url);
      if (existingImage) {
        existingImage.altText = img.altText || '';
        existingImage.sortOrder = img.sortOrder || 0;
        await manager.save(ProductImage, existingImage);
      } else {
        const newImg = manager.create(ProductImage, {
          productId: id,
          url: img.url,
          altText: img.altText,
          sortOrder: img.sortOrder || 0,
        });
        await manager.save(ProductImage, newImg);
      }
    }
  }

  private async handleSpecsUpdate(manager: EntityManager, id: string, specs: any[]) {
    await manager.delete(ProductSpec, { productId: id });
    if (specs.length > 0) {
      const productSpecs = specs.map(spec =>
        manager.create(ProductSpec, {
          productId: id,
          key: spec.key,
          value: spec.value,
          sortOrder: spec.sortOrder || 0,
        })
      );
      await manager.save(ProductSpec, productSpecs);
    }
  }
}
