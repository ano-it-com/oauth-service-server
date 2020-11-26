import { BaseTokenStrategy } from '@iac-auth/contracts/strategies';
import { ConfigService } from 'nestjs-config';
import { JwtService } from '@iac-auth/library/jwt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy implements BaseTokenStrategy {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  sign(payload: Record<any, any>): Promise<string> {
    return this.jwtService.sign(
      {
        ...payload,
        iss: this.config.get('application.url'),
      },
      'access_token',
    );
  }

  verify<P = any>(encrypted: string): Promise<P> {
    return this.jwtService.verify(encrypted, 'access_token');
  }
}
