import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { Order } from '../entities/order.entity.js';
import { OrderItem } from '../entities/order-item.entity.js';
import { User } from '../entities/user.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, User])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
