import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { WishlistsService } from './wishlists.service.js';
import { AuthGuard } from '@nestjs/passport';

@Controller('wishlists')
@UseGuards(AuthGuard('jwt'))
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  async getWishlist(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.wishlistsService.getUserWishlist(req.user.id, Number.parseInt(page, 10), Number.parseInt(limit, 10));
  }

  @Post()
  async addToWishlist(
    @Req() req: any,
    @Body('productId') productId: string,
  ) {
    return this.wishlistsService.addToWishlist(req.user.id, productId);
  }

  @Delete('clear')
  async clearWishlist(@Req() req: any) {
    return this.wishlistsService.clearWishlist(req.user.id);
  }

  @Delete(':productId')
  async removeFromWishlistUrl(
    @Req() req: any,
    @Param('productId') productId: string,
  ) {
    return this.wishlistsService.removeFromWishlist(req.user.id, productId);
  }

  // Backup for frontend that might still send DELETE /wishlists with body
  @Delete()
  async removeFromWishlistBody(
    @Req() req: any,
    @Body('productId') productId: string,
  ) {
    return this.wishlistsService.removeFromWishlist(req.user.id, productId);
  }
}
