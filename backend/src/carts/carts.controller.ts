import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CartsService } from './carts.service.js';
import { AuthGuard } from '@nestjs/passport';

@Controller('carts')
@UseGuards(AuthGuard('jwt'))
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  async getCart(@Req() req: any) {
    return this.cartsService.getCart(req.user.id);
  }

  @Post('items/all')
  async syncCart(
    @Req() req: any,
    @Body('items') items: { productId: string; quantity: number }[],
  ) {
    return this.cartsService.syncCart(req.user.id, items || []);
  }

  @Post('items')
  async addItem(
    @Req() req: any,
    @Body('productId') productId: string,
    @Body('quantity') quantity: number = 1,
  ) {
    return this.cartsService.addItem(req.user.id, productId, quantity);
  }

  @Patch('items/:productId')
  async updateQuantity(
    @Req() req: any,
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartsService.updateQuantity(req.user.id, productId, quantity);
  }

  @Delete('clear')
  async clearCart(@Req() req: any) {
    return this.cartsService.clearCart(req.user.id);
  }

  @Delete('items/:productId')
  async removeItem(
    @Req() req: any,
    @Param('productId') productId: string,
  ) {
    return this.cartsService.removeItem(req.user.id, productId);
  }
}
