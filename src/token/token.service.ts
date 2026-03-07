import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('refresh_token is required.');
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type.');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException();
      }

      return {
        access_token: this.jwtService.sign(
          { sub: user.id, email: user.email, type: 'access' },
          { expiresIn: '1h' },
        ),
        refresh_token: this.jwtService.sign(
          { sub: user.id, email: user.email, type: 'refresh' },
          { expiresIn: '7d' },
        ),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }
}
