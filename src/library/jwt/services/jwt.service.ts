import { Injectable } from '@nestjs/common';
import { CypherService } from '@iac-auth/library/cypher';
import { Repository } from 'typeorm';
import { KeyEntity } from '@iac-auth/core/oauth2/key.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from 'nestjs-config';
import { JWT, JWK, JWKS, JSONWebKeySet } from 'jose';
import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';

export type KeyUnion = JWK.RSAKey | JWK.ECKey | JWK.OKPKey | JWK.OctKey;

@Injectable()
export class JwtService {
  constructor(
    private readonly cypherService: CypherService,
    @InjectRepository(KeyEntity)
    private readonly keyRepository: Repository<KeyEntity>,
    private readonly configService: ConfigService,
  ) {}

  private asKey(data: string) {
    return JWK.asKey(
      {
        key: this.cypherService.decrypt(data),
        format: 'pem',
      },
      {
        alg: 'RS256',
        use: 'sig',
      },
    );
  }

  /**
   *
   * @param name
   * @param type
   */
  private async getKey(
    name: string,
    type: 'public' | 'private',
  ): Promise<KeyUnion> {
    const key = await this.keyRepository.findOne({ name, type });
    if (!key) throw new RuntimeException(`${type} key not found [${name}]`);

    return this.asKey(key.data);
  }

  /**
   *
   * @param payload
   * @param keyName
   */
  async sign(payload: Record<any, any>, keyName: string): Promise<string> {
    const key = await this.getKey(keyName, 'private');

    return JWT.sign(payload, key, {
      algorithm: this.configService.get('jwt.algorithm'),
      notBefore: '0s',
      issuer: this.configService.get('application.url'),
    });
  }

  /**
   *
   * @param token
   * @param keyName
   */
  async verify<P = any>(token: string, keyName: string): Promise<P> {
    const key = await this.getKey(keyName, 'public');

    return (JWT.verify(token, key, {
      algorithms: [this.configService.get('jwt.algorithm')],
      issuer: this.configService.get('application.url'),
    }) as any) as P;
  }

  decode<P = any>(token: string): P {
    return (JWT.decode(token) as any) as P;
  }

  /**
   *
   * @param keyName
   * @param type
   */
  async jwk(
    keyName: string,
    type: 'public' | 'private' = 'public',
  ): Promise<JsonWebKey> {
    const key = await this.getKey(keyName, type);

    return key.toJWK(type === 'private');
  }

  /**
   *
   * @param name
   * @param type
   */
  async jwks(
    name?: string,
    type?: 'public' | 'private',
  ): Promise<JSONWebKeySet> {
    const filters = {
      ...(name && { name }),
      ...(type && { type }),
    };

    const keys = await this.keyRepository.find(filters);
    const store = new JWKS.KeyStore();

    keys.forEach(key => {
      const rsaKey = this.asKey(key.data);
      store.add(rsaKey);
    });

    return store.toJWKS(type === 'private');
  }
}
