import { BaseTokenStrategy } from '@iac-auth/contracts/strategies';
import { Injectable } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import { CypherService } from '@iac-auth/library/cypher';

@Injectable()
export class AesStrategy implements BaseTokenStrategy {
  constructor(
    private readonly configService: ConfigService,
    private readonly cypherService: CypherService,
  ) {}

  async sign(payload: Record<any, any>): Promise<string> {
    return this.cypherService.encrypt({
      ...payload,
      iss: this.configService.get('application.url'),
    });
  }

  async verify<P = any>(encrypted: string): Promise<P> {
    return this.cypherService.decrypt(encrypted);
  }
}
