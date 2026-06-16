import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service.js';
import { Request } from 'express';
import { TokenPayload } from './jwt.strategy.js';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'), // Or from cookies/headers depending on your choice
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET') as string,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenPayload) {
    const refreshToken = request.body.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    // Verify if the refresh token matches the hashed one in DB
    const user = await this.usersService.getUserIfRefreshTokenMatches(
      refreshToken,
      payload.userId,
    );

    if (!user?.isActive) {
      throw new UnauthorizedException('Invalid refresh token or inactive user');
    }

    return user;
  }
}
