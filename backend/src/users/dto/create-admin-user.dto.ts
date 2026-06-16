import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, IsBoolean, IsOptional } from 'class-validator';
import { UserRole } from '../../entities/user.entity.js';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
