import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: 1, type: Number })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 'refresh_token', type: String })
  @IsString()
  refreshToken: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty({ example: 'access_token', type: String })
  accessToken: string;

  @ApiProperty({ example: 'refresh_token', type: String })
  refreshToken: string;
}
