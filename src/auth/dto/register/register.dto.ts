import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', type: String })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', type: String })
  @IsStrongPassword()
  password: string;
}

