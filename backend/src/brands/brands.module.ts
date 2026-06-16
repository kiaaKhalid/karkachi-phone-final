import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandsService } from './brands.service.js';
import { BrandsController } from './brands.controller.js';
import { Brand } from '../entities/index.js';
import { UploadModule } from '../upload/upload.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Brand]), UploadModule],
  controllers: [BrandsController],
  providers: [BrandsService],
  exports: [BrandsService],
})
export class BrandsModule {}
