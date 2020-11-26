import { BaseTokenService } from '@iac-auth/contracts/service/base-token.service';
import { OAuthCodeEntity } from '@iac-auth/core/oauth2/oauth-code.entity';
import { Repository } from 'typeorm';
import { CypherService } from '@iac-auth/library/cypher';
import { Injectable } from '@nestjs/common';
import { ClientEntity } from '@iac-auth/core/oauth2/client.entity';
import { AuthCodeData } from '@iac-auth/core/oauth2/interfaces';
import { OAuthException } from '@iac-auth/core/oauth2/exceptions';
import { TokenAuthMethod } from '@iac-auth/core/oauth2/const';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthCodeService extends BaseTokenService<OAuthCodeEntity> {
  constructor(
    @InjectRepository(OAuthCodeEntity)
    protected readonly repository: Repository<OAuthCodeEntity>,
    private readonly cypherService: CypherService,
  ) {
    super(repository);
  }

  public async create(
    repo = this.repository,
    clientId: string,
    userId: string,
    scopes: string[],
    redirectUri: string,
    ttl: number,
    nonce?: string,
  ): Promise<OAuthCodeEntity> {
    const authCode = repo.create({
      clientId,
      userId,
      scopes,
      redirectUri,
      nonce,
      expiresAt: this.getExpiration(ttl),
      revoked: false,
    });

    return repo.save(authCode);
  }

  public async getFromCode(
    code: string,
    client: ClientEntity,
    codeVerifier?: string,
  ): Promise<OAuthCodeEntity> {
    let authCodeData: AuthCodeData;

    try {
      authCodeData = this.cypherService.decrypt(code);
    } catch (e) {
      this.logger.error(
        `Cannot decrypt authorization code: ${e.message}`,
        e.stack,
      );
      throw OAuthException.invalidRequest('code');
    }

    if (authCodeData.expiresAt * 1000 < Date.now()) {
      this.logger.warn(`Authorization code ${authCodeData.id} expired`);
      throw OAuthException.invalidRequest('code');
    }

    if (client.canHandleAuthMethod(TokenAuthMethod.none)) {
      this.validateCodeChallenge(authCodeData, codeVerifier);
    }

    const authCode = await this.repository.findOne(authCodeData.id);

    if (!authCode) {
      this.logger.warn(`Authorization code ${authCode.id} not found`);
      throw OAuthException.invalidRequest('code');
    }

    if (authCode.expiresAt.getTime() < Date.now()) {
      this.logger.warn(`Authorization code ${authCode.id} expired`);
      throw OAuthException.invalidRequest('code');
    }

    if (authCode.revoked) {
      this.logger.warn(`Authorization code ${authCode.id} revoked`);
      throw OAuthException.invalidRequest('code');
    }

    return authCode;
  }

  protected validateCodeChallenge(
    authCodePayload: AuthCodeData,
    codeVerifier?: string,
  ): void {
    if (!codeVerifier) {
      throw OAuthException.invalidRequest('code_verifier');
    }

    if (authCodePayload.codeChallengeMethod === 'plain') {
      if (authCodePayload.codeChallenge !== codeVerifier) {
        throw OAuthException.invalidCodeChallenge();
      }
    } else {
      const hash = this.cypherService.sha256(codeVerifier);
      const base64 = Buffer.from(hash).toString('base64');
      if (base64 !== authCodePayload.codeChallenge) {
        throw OAuthException.invalidCodeChallenge();
      }
    }
  }
}
