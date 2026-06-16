import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryRule } from '../entities/delivery-rule.entity.js';

@Injectable()
export class DeliveryRulesService {
  constructor(
    @InjectRepository(DeliveryRule)
    private readonly deliveryRuleRepository: Repository<DeliveryRule>,
  ) {}

  async findAll() {
    return this.deliveryRuleRepository.find({
      order: { minOrderAmount: 'ASC' }
    });
  }

  async findActive() {
    return this.deliveryRuleRepository.find({
      where: { isActive: true },
      order: { minOrderAmount: 'ASC' }
    });
  }

  async create(data: Partial<DeliveryRule>) {
    const rule = this.deliveryRuleRepository.create(data);
    return this.deliveryRuleRepository.save(rule);
  }

  async update(id: string, data: Partial<DeliveryRule>) {
    const rule = await this.deliveryRuleRepository.findOne({ where: { id } });
    if (!rule) throw new NotFoundException('Delivery Rule not found');
    
    Object.assign(rule, data);
    return this.deliveryRuleRepository.save(rule);
  }

  async remove(id: string) {
    const rule = await this.deliveryRuleRepository.findOne({ where: { id } });
    if (!rule) throw new NotFoundException('Delivery Rule not found');
    return this.deliveryRuleRepository.remove(rule);
  }
}
