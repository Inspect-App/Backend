import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
