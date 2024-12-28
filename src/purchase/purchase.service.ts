import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { SubscriptionType, User } from '@prisma/client';
import { PurchaseDto } from './dto/purchase.dto';

@Injectable()
export class PurchaseService {
    constructor(
        private prisma: PrismaService
    ) {}

    async verifyPurchase(purchaseDto: PurchaseDto): Promise<User> {
        try {
            const {id, receipt, platform, productId} = purchaseDto;

                if (productId === 'com.inspect.subscription.monthly') {
                    return await this.handleMonthlySubscription(id);
                } else if (productId === 'com.inspect.purchase.one_time') {
                    return await this.handleOneTimePurchase(id);
                }
        } catch (error) {
            console.error('Receipt validation failed', error);
            throw new BadRequestException('Receipt validation failed');
        }
    }

    private async handleMonthlySubscription(id: number): Promise<User> {
        const newExpiryDate = new Date();
        newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);

        return await this.prisma.user.update({
            where: {id},
            data: {
                subscriptionType: SubscriptionType.monthly,
                subscriptionExpiry: newExpiryDate,
                isPremium: true
            },
        });
    }

    private async handleOneTimePurchase(id: number): Promise<User> {
        return await this.prisma.user.update({
            where: {id},
            data: {
                subscriptionType: SubscriptionType.one_time,
                isPremium: true,
            },
        });
    }
}
