import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DeliveryRulesService } from './delivery-rules.service.js';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../entities/user.entity.js';

@Controller('delivery-rules')
export class DeliveryRulesController {
  constructor(private readonly deliveryRulesService: DeliveryRulesService) {}

  // Public endpoint
  @Get()
  async getActiveRules() {
    const data = await this.deliveryRulesService.findActive();
    return { success: true, data };
  }

  // Admin endpoints
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin')
  async getAllRules() {
    const data = await this.deliveryRulesService.findAll();
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async createRule(@Body() data: any) {
    const result = await this.deliveryRulesService.create(data);
    return { success: true, data: result };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async updateRule(@Param('id') id: string, @Body() data: any) {
    const result = await this.deliveryRulesService.update(id, data);
    return { success: true, data: result };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async deleteRule(@Param('id') id: string) {
    await this.deliveryRulesService.remove(id);
    return { success: true, message: 'Deleted successfully' };
  }
}
