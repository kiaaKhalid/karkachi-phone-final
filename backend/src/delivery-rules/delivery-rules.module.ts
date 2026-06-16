import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryRulesService } from './delivery-rules.service.js';
import { DeliveryRulesController } from './delivery-rules.controller.js';
import { DeliveryRule } from '../entities/delivery-rule.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryRule])],
  controllers: [DeliveryRulesController],
  providers: [DeliveryRulesService],
  exports: [DeliveryRulesService],
})
export class DeliveryRulesModule {}
