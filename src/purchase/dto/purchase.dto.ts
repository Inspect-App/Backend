export class PurchaseDto {
    id: number;

    receipt: string;

    platform: 'apple' | 'google';

    productId: string;
}