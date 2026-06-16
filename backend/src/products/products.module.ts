import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service.js';
import { ProductsController } from './products.controller.js';
import { Product, ProductImage, ProductSpec } from '../entities/index.js';
import { UploadModule } from '../upload/upload.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage, ProductSpec]),
    UploadModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
