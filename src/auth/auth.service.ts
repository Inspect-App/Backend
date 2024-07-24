import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from 'interfaces/user.interface';
import { JwtPayload } from 'interfaces/jwt.payload';
import { UserResponseDto } from './dto/user/user.dto';
import { RegisterDto } from './dto/register/register.dto';
import { VerifyDto } from './dto/verify/verify.dto';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mailerService: MailerService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(
    user: Omit<User, 'password'>,
  ): Promise<{ accessToken: string; refreshToken: string }> {

    return this.getTokensAndUserFromUser(user);
  }

  async getTokensAndUserFromUser(user: Omit<User, 'password'>): Promise<
    { accessToken: string; refreshToken: string, user: Omit<User, 'password'> }
  >
   {
    const payload: JwtPayload = { email: user.email, id: user.id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    // make sure password is not included in the response

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: user,
    };
  }

  async refreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    Logger.log(JSON.stringify(user));

    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    const payload: JwtPayload = { email: user.email, id: user.id };
    const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: newRefreshToken },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async getMe(userId: number): Promise<UserResponseDto> {
    const user: User = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, createdAt, updatedAt, ...result } = user;
    return result;
  }

  async register(registerDto: RegisterDto): Promise<void> {
    const { email, password, firstName, lastName } = registerDto;
    const existingUser = (await this.prisma.user.findUnique({
      where: { email },
    })) as User;
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    try {
      await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          verificationCode,
          isVerified: false,
        },
      });

      this.mailerService.sendVerificationEmail(email, verificationCode);
    } catch (error) {
      await this.prisma.user.delete({ where: { email } });
      throw new BadRequestException('Failed to register user');
    }
  }

  async verify(verifyDto: VerifyDto): Promise<
    { accessToken: string; refreshToken: string }
  > {
    const { email, verificationCode } = verifyDto;
    const user = (await this.prisma.user.findUnique({
      where: { email },
    })) as User;

    if (!user || user.verificationCode !== verificationCode) {
      throw new UnauthorizedException('Invalid verification code');
    }

    await this.prisma.user.update({
      where: { email },
      data: { verificationCode: null, isVerified: true },
    });
    const { password, ...result } = user;
    return this.getTokensAndUserFromUser(result);
  }
}
