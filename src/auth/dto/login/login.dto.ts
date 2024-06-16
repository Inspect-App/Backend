import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', type: String })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', type: String })
  @IsStrongPassword()
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'access_token', type: String })
  accessToken: string;

  @ApiProperty({ example: 'refresh_token', type: String })
  refreshToken: string;
}
