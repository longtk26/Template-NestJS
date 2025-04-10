import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigEnum } from 'src/config/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    console.log('JWT secret', configService.get<string>(ConfigEnum.SECRET_KEY));
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['HS256'],
      secretOrKey: configService.get<string>(ConfigEnum.SECRET_KEY),
      passReqToCallback: true,
    });
  }
  async validate(request: any, payload: any) {
    const rawToken = request.headers.authorization?.split(' ')[1];
    console.log('rawToken', rawToken);
    // if (!rawToken) {
    //   throw new UnauthorizedException('Token is missing or expired');
    // }

    return payload;
  }
}
