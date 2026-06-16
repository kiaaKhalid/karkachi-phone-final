import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Res,
} from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../entities/user.entity.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { OrderStatus } from '../entities/order.entity.js';
import type { Response } from 'express';

@Controller('admin/orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '25',
    @Query('status') status?: OrderStatus,
  ) {
    const pageNum = Number.parseInt(page, 10);
    const limitNum = Number.parseInt(limit, 10);
    const data = await this.ordersService.findAll(pageNum, limitNum, status);
    
    return {
      success: true,
      message: 'Orders retrieved successfully',
      data,
    };
  }

  @Get('exports')
  async exportPdf(@Res() res: Response) {
    const stream = await this.ordersService.exportOrdersToPdf();
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="orders-export.pdf"',
    });

    stream.pipe(res);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.ordersService.findOne(id);
    
    return {
      success: true,
      message: 'Order details retrieved successfully',
      data,
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const data = await this.ordersService.updateStatus(id, updateOrderStatusDto);
    
    return {
      success: true,
      message: 'Order status updated successfully',
      data,
    };
  }
}
