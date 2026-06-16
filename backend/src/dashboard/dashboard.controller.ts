import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../entities/user.entity.js';
import { DashboardService } from './dashboard.service.js';

@Controller('admin/dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('static')
  async getStaticStats() {
    const data = await this.dashboardService.getStaticStats();
    return {
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data,
    };
  }

  @Get('orders')
  async getRecentOrders() {
    const data = await this.dashboardService.getRecentOrders();
    return {
      success: true,
      message: 'Recent orders retrieved successfully',
      data,
    };
  }
}
