import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/index.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { UploadService } from '../upload/upload.service.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    private readonly uploadService: UploadService,
  ) {}

  async findAll(page: number = 1, limit: number = 1000) {
    const skip = (page - 1) * limit;

    const [categories, total] = await this.categoriesRepository
      .createQueryBuilder('category')
      .skip(skip)
      .take(limit)
      .orderBy('category.sortOrder', 'ASC')
      .addOrderBy('category.createdAt', 'DESC')
      .getManyAndCount();

    if (categories.length > 0) {
      const categoryIds = categories.map((c) => c.id);
      const counts = await this.categoriesRepository.manager
        .createQueryBuilder()
        .select('product.categoryId', 'categoryId')
        .addSelect('COUNT(product.id)', 'count')
        .from('products', 'product')
        .where('product.categoryId IN (:...categoryIds)', { categoryIds })
        .groupBy('product.categoryId')
        .getRawMany();

      const countMap = new Map();
      counts.forEach((c) => countMap.set(c.categoryId, Number.parseInt(c.count, 10)));

      categories.forEach((c) => {
        (c as any).productCount = countMap.get(c.id) || 0;
      });
    }

    return {
      items: categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const countRaw = await this.categoriesRepository.manager
      .createQueryBuilder()
      .select('COUNT(product.id)', 'count')
      .from('products', 'product')
      .where('product.categoryId = :id', { id })
      .getRawOne();

    (category as any).productCount = Number.parseInt(countRaw.count, 10) || 0;

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const existing = await this.categoriesRepository.findOne({
      where: { slug: createCategoryDto.slug },
    });

    if (existing) {
      throw new ConflictException(`Category with slug '${createCategoryDto.slug}' already exists`);
    }

    const category = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoriesRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existing = await this.categoriesRepository.findOne({
        where: { slug: updateCategoryDto.slug },
      });
      if (existing) {
        throw new ConflictException(`Category with slug '${updateCategoryDto.slug}' already exists`);
      }
    }

    const oldImage = category.image;
    Object.assign(category, updateCategoryDto);
    const updated = await this.categoriesRepository.save(category);

    if (updateCategoryDto.image !== undefined && oldImage && updateCategoryDto.image !== oldImage) {
      await this.uploadService.deleteImage(oldImage);
    }

    return updated;
  }

  async activate(id: string) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    category.isActive = true;
    return this.categoriesRepository.save(category);
  }

  async deactivate(id: string) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    category.isActive = false;
    return this.categoriesRepository.save(category);
  }

  async remove(id: string) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    const image = category.image;
    await this.categoriesRepository.remove(category);

    if (image) {
      await this.uploadService.deleteImage(image);
    }

    return { deleted: true };
  }
}
