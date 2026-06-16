import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service.js';
import { User } from '../entities/index.js';
import { SuperAdminUsersController } from './super-admin-users.controller.js';

// Module gérant les utilisateurs

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [SuperAdminUsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
