import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../entities/user.entity.js';
import { AnalyticsService } from './analytics.service.js';

@Controller('admin/analytics')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('static')
  async getStaticData(@Query('period') period: string = 'last30days') {
    const data = await this.analyticsService.getStaticData(period);
    return {
      success: true,
      message: 'Static analytics data fetched successfully',
      data,
    };
  }

  @Get('graph')
  async getGraphData(@Query('period') period: string = 'last30days') {
    const data = await this.analyticsService.getGraphData(period);
    return {
      success: true,
      message: 'Graph analytics data fetched successfully',
      data,
    };
  }
}
