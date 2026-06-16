import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  ConflictException,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../entities/user.entity.js';
import { UsersService } from './users.service.js';
import { CreateAdminUserDto } from './dto/create-admin-user.dto.js';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto.js';

@Controller('super-admin/users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SuperAdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const data = await this.usersService.findForAdmin(
      Number.parseInt(page, 10),
      Number.parseInt(limit, 10),
      search,
      role,
      status,
      sortBy,
      sortOrder,
    );
    return { success: true, data };
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  async create(@Body() createAdminUserDto: CreateAdminUserDto) {
    const existing = await this.usersService.findByEmail(createAdminUserDto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
    const user = await this.usersService.createAdminUser(createAdminUserDto);
    // Don't return password
    delete (user as any).password;
    return { success: true, data: user };
  }

  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN)
  async activate(@Param('id') id: string) {
    const user = await this.usersService.updateStatus(id, true);
    return { success: true, data: user };
  }

  @Patch(':id/desactivate')
  @Roles(UserRole.SUPER_ADMIN)
  async desactivate(@Param('id') id: string, @Req() req: any) {
    if (req.user.id === id) {
      throw new ForbiddenException('You cannot deactivate yourself');
    }
    const user = await this.usersService.updateStatus(id, false);
    return { success: true, data: user };
  }

  @Patch(':id/role')
  @Roles(UserRole.SUPER_ADMIN)
  async updateRole(@Param('id') id: string, @Body('role') role: UserRole, @Req() req: any) {
    if (req.user.id === id) {
      throw new ForbiddenException('You cannot change your own role');
    }
    const user = await this.usersService.updateRole(id, role);
    return { success: true, data: { user } };
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN)
  async update(@Param('id') id: string, @Body() updateAdminUserDto: UpdateAdminUserDto) {
    if (updateAdminUserDto.email) {
      const existing = await this.usersService.findByEmail(updateAdminUserDto.email);
      if (existing && existing.id !== id) {
        throw new ConflictException('Email is already in use by another account');
      }
    }
    const user = await this.usersService.updateUser(id, updateAdminUserDto);
    return { success: true, data: user };
  }
}
