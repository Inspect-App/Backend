// guards/jwt-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'interfaces/jwt.payload';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException({
        response: { status: 401, errors: { token: 'Token not found' } },
        status: 401,
        message: 'Token not found',
        name: 'UnauthorizedException',
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });
      if (!user) {
        throw new UnauthorizedException({
          response: { status: 401, errors: { user: 'User not found' } },
          status: 401,
          message: 'User not found',
          name: 'UnauthorizedException',
        });
      }
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException({
        response: { status: 401, errors: { token: 'Invalid token' } },
        status: 401,
        message: 'Invalid token',
        name: 'UnauthorizedException',
      });
    }
  }

  private extractTokenFromHeader(request: any): string | null {
    const authorization = request.headers.authorization;
    if (authorization && authorization.startsWith('Bearer ')) {
      return authorization.split(' ')[1];
    }
    return null;
  }
}
