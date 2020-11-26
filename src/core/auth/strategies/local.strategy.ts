import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserService } from '@iac-auth/core/users/services/user.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserEntity } from '@iac-auth/core/users/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {
    super({
      usernameField: 'email',
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    email: string,
    password: string,
  ): Promise<[UserEntity, any]> {
    return [
      await this.userService.findAndAuthenticate({ email, password }, req),
      {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        createdAt: Date.now(),
      },
    ];
  }
}
