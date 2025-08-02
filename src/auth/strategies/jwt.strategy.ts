import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'yourSecretKey', // 使用和 JwtModule 相同的密钥
    });
  }

  async validate(payload: any) {
    // 返回包含 id 字段的用户对象，保持与控制器期望一致
    return { id: payload.sub, email: payload.email };
  }
}
