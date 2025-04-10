import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { ConfigEnum } from 'src/config/config';
import { JwtConfig } from 'src/config/interface';
import { UserPayloadJWT } from 'src/applications/user/interface/user.interface';
import bcrypt from 'bcryptjs';

@Injectable()
export class SecurityService {
  constructor(private readonly config: ConfigService) {}

  createAccessAndRefreshToken(payload: UserPayloadJWT) {
    const jwtConfig = this.config.get<JwtConfig>(ConfigEnum.JWT_CONFIG);
    console.log(jwtConfig);

    const accessToken = jwt.sign(
      payload,
      this.config.get(ConfigEnum.SECRET_KEY),
      {
        expiresIn: parseInt(jwtConfig?.accessTokenExpires) || '1d',
      },
    );

    const refreshToken = jwt.sign(
      payload,
      this.config.get(ConfigEnum.SECRET_KEY),
      {
        expiresIn: parseInt(jwtConfig?.refreshTokenExpires) || '7d',
      },
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(accessToken: string) {
    try {
      console.log(this.config.get(ConfigEnum.SECRET_KEY));
      return jwt.verify(accessToken, this.config.get(ConfigEnum.SECRET_KEY));
    } catch (error) {
      console.log(`Error when verifying access token: ${error.message}`);
      return null;
    }
  }

  async hashPassword(password: string) {
    try {
      return await bcrypt.hash(
        password,
        parseInt(this.config.get(ConfigEnum.SALT_ROUNDS)),
      );
    } catch (error) {
      console.log(`Error hash password: ${error.message}`);
    }
  }

  async comparePassword(password: string, hashedPassword: string) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.log(`Error compare password: ${error.message}`);
    }
  }
}
