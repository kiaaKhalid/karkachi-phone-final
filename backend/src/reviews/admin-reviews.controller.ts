import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../entities/user.entity.js';
import { ReviewsService } from './reviews.service.js';

@Controller('admin/reviews')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  async getReviews(
    @Query('page') pageStr: string = '1',
    @Query('limit') limitStr: string = '10',
  ) {
    const page = Number.parseInt(pageStr, 10) || 1;
    const limit = Number.parseInt(limitStr, 10) || 10;
    
    const data = await this.reviewsService.findAllPaginated(page, limit);
    return {
      success: true,
      message: 'Reviews fetched successfully',
      data,
    };
  }

  @Patch(':id/verified')
  async verifyReview(@Param('id') id: string) {
    await this.reviewsService.setVerificationStatus(id, true);
    return {
      success: true,
      message: 'Review verified successfully',
    };
  }

  @Patch(':id/not-verified')
  async unverifyReview(@Param('id') id: string) {
    await this.reviewsService.setVerificationStatus(id, false);
    return {
      success: true,
      message: 'Review unverified successfully',
    };
  }
}
