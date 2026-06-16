import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../entities/index.js';
import { CreateBrandDto } from './dto/create-brand.dto.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';
import { UploadService } from '../upload/upload.service.js';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandsRepository: Repository<Brand>,
    private readonly uploadService: UploadService,
  ) {}

  async findAll(page: number = 1, limit: number = 1000) {
    const skip = (page - 1) * limit;

    const [brands, total] = await this.brandsRepository
      .createQueryBuilder('brand')
      .skip(skip)
      .take(limit)
      .orderBy('brand.name', 'ASC')
      .getManyAndCount();

    if (brands.length === 0) {
      return {
        items: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const brandIds = brands.map((b) => b.id);
    
    // Subquery to get product counts per brand
    const productCounts = await this.brandsRepository
      .createQueryBuilder('brand')
      .leftJoin('brand.products', 'product')
      .select('brand.id', 'brandId')
      .addSelect('COUNT(product.id)', 'count')
      .where('brand.id IN (:...brandIds)', { brandIds })
      .groupBy('brand.id')
      .getRawMany();

    const countMap = new Map<string, number>();
    productCounts.forEach((pc) => {
      countMap.set(pc.brandId, Number.parseInt(pc.count, 10));
    });

    const items = brands.map((brand) => {
      const brandObj = {
        ...brand,
        productCount: countMap.get(brand.id) || 0,
      };
      return brandObj;
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const brand = await this.brandsRepository.findOne({
      where: { id },
      relations: { products: true },
    });
    if (!brand) throw new NotFoundException(`Brand with ID ${id} not found`);
    return brand;
  }

  async create(createBrandDto: CreateBrandDto) {
    const existing = await this.brandsRepository.findOne({
      where: { slug: createBrandDto.slug },
    });
    if (existing) {
      throw new ConflictException(`Brand with slug '${createBrandDto.slug}' already exists`);
    }

    const brand = this.brandsRepository.create(createBrandDto);
    return this.brandsRepository.save(brand);
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const brand = await this.brandsRepository.findOne({ where: { id } });
    if (!brand) throw new NotFoundException(`Brand with ID ${id} not found`);

    if (updateBrandDto.slug && updateBrandDto.slug !== brand.slug) {
      const existing = await this.brandsRepository.findOne({
        where: { slug: updateBrandDto.slug },
      });
      if (existing) {
        throw new ConflictException(`Brand with slug '${updateBrandDto.slug}' already exists`);
      }
    }

    const oldLogo = brand.logo;
    Object.assign(brand, updateBrandDto);
    const updated = await this.brandsRepository.save(brand);

    if (updateBrandDto.logo !== undefined && oldLogo && updateBrandDto.logo !== oldLogo) {
      await this.uploadService.deleteImage(oldLogo);
    }

    return updated;
  }

  async activate(id: string) {
    const brand = await this.brandsRepository.findOne({ where: { id } });
    if (!brand) throw new NotFoundException(`Brand with ID ${id} not found`);
    brand.isActive = true;
    return this.brandsRepository.save(brand);
  }

  async deactivate(id: string) {
    const brand = await this.brandsRepository.findOne({ where: { id } });
    if (!brand) throw new NotFoundException(`Brand with ID ${id} not found`);
    brand.isActive = false;
    return this.brandsRepository.save(brand);
  }

  async remove(id: string) {
    const brand = await this.brandsRepository.findOne({ where: { id } });
    if (!brand) throw new NotFoundException(`Brand with ID ${id} not found`);

    const logo = brand.logo;
    await this.brandsRepository.remove(brand);

    if (logo) {
      await this.uploadService.deleteImage(logo);
    }

    return { deleted: true };
  }
}
