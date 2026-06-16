import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PromotionsService } from './promotions.service.js';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../entities/user.entity.js';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  // Public endpoint
  @Post('validate')
  async validateCode(@Body() body: { code: string; orderAmount: number }) {
    const { code, orderAmount } = body;
    return this.promotionsService.validateCode(code, orderAmount);
  }

  // Admin endpoints
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin')
  async getAllPromotions() {
    const data = await this.promotionsService.findAll();
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async createPromotion(@Body() data: any) {
    const result = await this.promotionsService.create(data);
    return { success: true, data: result };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async updatePromotion(@Param('id') id: string, @Body() data: any) {
    const result = await this.promotionsService.update(id, data);
    return { success: true, data: result };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async deletePromotion(@Param('id') id: string) {
    await this.promotionsService.remove(id);
    return { success: true, message: 'Deleted successfully' };
  }
}
