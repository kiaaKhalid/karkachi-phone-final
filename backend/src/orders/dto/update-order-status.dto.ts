import { IsEnum, IsNumber, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../../entities/order.entity.js';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, description: 'The new status of the order' })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  @ApiProperty({ description: 'The current version of the order for optimistic locking' })
  @IsNumber()
  @IsNotEmpty()
  version: number;
}
