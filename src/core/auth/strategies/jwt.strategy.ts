import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtService } from '@iac-auth/library/jwt';
import { Repository } from 'typeorm';
import { UserEntity } from '@iac-auth/core/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { plainToClass } from 'class-transformer';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'access_token',
      passReqToCallback: true,
    });

    (Strategy as any).JwtVerifier = (
      token,
      keyName,
      __,
      cb: (err: any, payload: any) => void,
    ) => {
      this.jwtService
        .verify(token, keyName)
        .then(payload => cb(null, payload))
        .catch(err => cb(err, null));
    };
  }

  async validate(request: Request, data: any): Promise<UserEntity> {
    const user = await this.userRepository.findOne(data.sub);
    request.accessToken = data;

    if (!user) throw new UnauthorizedException();

    return plainToClass(UserEntity, user);
  }
}
