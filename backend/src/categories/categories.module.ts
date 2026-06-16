import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service.js';
import { CategoriesController } from './categories.controller.js';
import { Category } from '../entities/index.js';
import { UploadModule } from '../upload/upload.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), UploadModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
