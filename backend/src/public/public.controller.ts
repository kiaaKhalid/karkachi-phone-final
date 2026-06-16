import { Controller, Get, Query, Param } from '@nestjs/common';
import { PublicService } from './public.service.js';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}



  @Get('products')
  async getProducts(@Query() query: any) {
    const data = await this.publicService.getProducts(query);
    return { success: true, data };
  }

  @Get('reviews/products/:productId')
  async getReviewsByProductId(@Param('productId') productId: string, @Query() query: any) {
    const data = await this.publicService.getReviewsByProductId(productId, query);
    return { success: true, data };
  }


  @Get('category')
  async getCategories() {
    const data = await this.publicService.getCategories();
    return { success: true, data };
  }

  @Get('brands/logo')
  async getBrandsLogo() {
    const data = await this.publicService.getBrandsLogo();
    return { success: true, data };
  }

  @Get('products/best-sellers')
  async getBestSellers() {
    const data = await this.publicService.getBestSellers();
    return { success: true, data };
  }

  @Get('products/recommended')
  async getRecommendedProducts() {
    const data = await this.publicService.getRecommendedProducts();
    return { success: true, data };
  }

  @Get('products/flash-deals')
  async getFlashDeals() {
    const data = await this.publicService.getFlashDeals();
    return { success: true, data };
  }

  @Get('products/deals')
  async getDealsPaginated(@Query() query: any) {
    const data = await this.publicService.getDealsPaginated(query);
    return { success: true, data };
  }
  @Get('products/:id')
  async getProductById(@Param('id') id: string) {
    const data = await this.publicService.getProductById(id);
    return { success: true, data };
  }
}
