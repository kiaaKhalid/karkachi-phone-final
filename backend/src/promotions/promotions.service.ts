import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion, PromotionType } from '../entities/promotion.entity.js';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
  ) {}

  async findAll() {
    return this.promotionRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findActive() {
    return this.promotionRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  async create(data: Partial<Promotion>) {
    if (data.code) {
      data.code = data.code.toUpperCase();
    }
    const promo = this.promotionRepository.create(data);
    return this.promotionRepository.save(promo);
  }

  async update(id: string, data: Partial<Promotion>) {
    const promo = await this.promotionRepository.findOne({ where: { id } });
    if (!promo) throw new NotFoundException('Promotion not found');
    
    if (data.code) {
      data.code = data.code.toUpperCase();
    }
    Object.assign(promo, data);
    return this.promotionRepository.save(promo);
  }

  async remove(id: string) {
    const promo = await this.promotionRepository.findOne({ where: { id } });
    if (!promo) throw new NotFoundException('Promotion not found');
    return this.promotionRepository.remove(promo);
  }

  async validateCode(code: string, orderAmount: number) {
    const promo = await this.promotionRepository.findOne({ 
      where: { code: code.toUpperCase(), isActive: true } 
    });

    if (!promo) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    if (promo.startsAt && new Date() < new Date(promo.startsAt)) {
      throw new BadRequestException('Ce code n\'est pas encore valide');
    }

    if (promo.endsAt && new Date() > new Date(promo.endsAt)) {
      throw new BadRequestException('Ce code a expiré');
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      throw new BadRequestException('Ce code a atteint sa limite d\'utilisation');
    }

    if (promo.minimumOrderAmount && orderAmount < Number(promo.minimumOrderAmount)) {
      throw new BadRequestException(`Le montant minimum est de ${promo.minimumOrderAmount} MAD`);
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.type === PromotionType.FIXED) {
      discountAmount = Number(promo.value);
    } else if (promo.type === PromotionType.PERCENTAGE) {
      discountAmount = (orderAmount * Number(promo.value)) / 100;
    } else if (promo.type === PromotionType.FREE_SHIPPING) {
      // Free shipping is handled on the frontend by setting shipping to 0
    }

    // Do not increment usedCount here, only increment it when order is actually placed!
    // For now we just return the validation result

    return {
      success: true,
      data: {
        id: promo.id,
        code: promo.code,
        type: promo.type,
        value: promo.value,
        discountAmount: discountAmount
      }
    };
  }
}
