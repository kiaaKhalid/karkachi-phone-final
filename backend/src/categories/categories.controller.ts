import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../entities/user.entity.js';

@Controller('admin/categories')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(1000), ParseIntPipe) limit: number,
  ) {
    return this.categoriesService.findAll(page, limit);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  activate(@Param('id') id: string) {
    return this.categoriesService.activate(id);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  deactivate(@Param('id') id: string) {
    return this.categoriesService.deactivate(id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
