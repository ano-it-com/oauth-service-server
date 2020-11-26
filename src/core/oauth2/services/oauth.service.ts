import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  ClientService,
  GrantInterface,
  GrantScanner,
} from '@iac-auth/core/oauth2/modules/common';
import { JwtService } from '@iac-auth/library/jwt';
import {
  BaseTokenStrategy,
  TOKEN_STRATEGY,
} from '@iac-auth/contracts/strategies';
import { CypherService } from '@iac-auth/library/cypher';
import { ConfigService } from 'nestjs-config';
import { ModuleRef } from '@nestjs/core';
import { Repository } from 'typeorm';
import { OAuthAccessTokenEntity } from '@iac-auth/core/oauth2/oauth-access-token.entity';
import { OAuthRefreshTokenEntity } from '@iac-auth/core/oauth2/oauth-refresh-token.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OAuthService implements OnModuleInit {
  protected logger = new Logger(this.constructor.name);

  protected grants: GrantInterface[] = [];

  @Inject(JwtService)
  protected readonly jwtService: JwtService;

  @Inject(ClientService)
  protected readonly clientService: ClientService;

  @Inject(TOKEN_STRATEGY)
  protected readonly tokenStrategy: BaseTokenStrategy;

  @Inject(CypherService)
  protected readonly cypherService: CypherService;

  @Inject(ConfigService)
  protected readonly config: ConfigService;

  @Inject(ModuleRef)
  private readonly moduleRef: ModuleRef;

  constructor(
    @InjectRepository(OAuthAccessTokenEntity)
    protected readonly accessTokenRepository: Repository<
      OAuthAccessTokenEntity
    >,
    @InjectRepository(OAuthRefreshTokenEntity)
    protected readonly refreshTokenRepository: Repository<
      OAuthRefreshTokenEntity
    >,
  ) {}

  onModuleInit(): any {
    const scanner = new GrantScanner();
    const grantMap = scanner.scan(this.moduleRef);
    this.grants.push(...grantMap.values());
  }
}
