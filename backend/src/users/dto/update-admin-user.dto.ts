import { PartialType } from '@nestjs/swagger';
import { CreateAdminUserDto } from './create-admin-user.dto.js';
import { IsOptional, MinLength, IsString } from 'class-validator';

export class UpdateAdminUserDto extends PartialType(CreateAdminUserDto) {
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
