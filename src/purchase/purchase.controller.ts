import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { PurchaseService } from './purchase.service';
import { PurchaseDto } from './dto/purchase.dto';

@UseGuards(JwtAuthGuard)
@Controller('purchase')
export class PurchaseController {
    constructor(private purchaseService: PurchaseService) {}

    @Post('verify')
    async verifyPurchase(@Body() purchaseDto: PurchaseDto) {
        return this.purchaseService.verifyPurchase(purchaseDto);
    }
}
