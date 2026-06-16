import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsDateString,
  ValidateNested,
  Min,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductColorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  hex: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class ProductImageDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsOptional()
  altText?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class ProductSpecDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  originalPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  @IsOptional()
  isNew?: boolean;

  @IsBoolean()
  @IsOptional()
  isBestSeller?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isFlashDeal?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  flashPrice?: number;

  @IsDateString()
  @IsOptional()
  flashStartsAt?: string;

  @IsDateString()
  @IsOptional()
  flashEndsAt?: string;

  @IsBoolean()
  @IsOptional()
  isPromotionalBanner?: boolean;

  @IsBoolean()
  @IsOptional()
  isProductPhare?: boolean;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  brandId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  @IsOptional()
  images?: ProductImageDto[];

  @IsBoolean()
  @IsOptional()
  hasColors?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductColorDto)
  @IsOptional()
  colors?: ProductColorDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSpecDto)
  @IsOptional()
  specs?: ProductSpecDto[];
}
