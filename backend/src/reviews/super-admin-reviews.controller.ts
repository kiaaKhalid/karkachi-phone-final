import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../entities/user.entity.js';
import { ReviewsService } from './reviews.service.js';

@Controller('super-admin/reviews')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SuperAdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Delete(':id')
  async deleteReview(@Param('id') id: string) {
    await this.reviewsService.deleteReview(id);
    return {
      success: true,
      message: 'Review deleted successfully',
    };
  }
}
