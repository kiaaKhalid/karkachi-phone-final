import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';
import { Order } from '../entities/order.entity.js';
import { User } from '../entities/user.entity.js';
import { Product } from '../entities/product.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User, Product])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
