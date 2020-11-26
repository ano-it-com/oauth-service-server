import { AbstractGrant } from '@iac-auth/core/oauth2/modules/common';
import { InjectableGrant } from '@iac-auth/core/oauth2/modules/common/decorators/injectable.grant.decorator';
import { GrantTypes } from '@iac-auth/core/oauth2/const';
import { AuthCodeService } from '@iac-auth/core/oauth2/modules/authorization-code/services/auth-code.service';
import { AuthorizationDto, TokenDto } from '@iac-auth/core/oauth2/dto';
import { AuthenticationRequest } from '@iac-auth/core/oauth2/authentication.request';
import { OAuthException } from '@iac-auth/core/oauth2/exceptions';
import { ClientEntity } from '@iac-auth/core/oauth2/client.entity';
import { OAuthCodeEntity } from '@iac-auth/core/oauth2/oauth-code.entity';
import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
import { UserEntity } from '@iac-auth/core/users/user.entity';
import { Repository } from 'typeorm';
import { AccessTokenRequestResponse } from '@iac-auth/core/oauth2/interfaces';
import { Request } from 'express';

@InjectableGrant(GrantTypes.authorization_code)
export class AuthorizationCodeServiceGrant extends AbstractGrant {
  constructor(protected readonly authCodeService: AuthCodeService) {
    super();
  }

  canRespondToAuthorizationRequest(query: Record<string, any>): boolean {
    return true;
  }

  async createAuthRequest(
    data: AuthorizationDto,
  ): Promise<AuthenticationRequest> {
    const client = await this.getClient(data, null, false);
    if (!client.canHandleResponseType(data.response_type)) {
      this.logger.warn(
        `Client ${client.id} cannot handle ${data.response_type} response type`,
      );
      throw OAuthException.invalidRequest('response_type');
    }

    if (!client.canHandleResponseMode(data.response_mode)) {
      this.logger.warn(
        `Client ${client.id} cannot handle ${data.response_mode} response mode`,
      );
      throw OAuthException.invalidRequest('response_mode');
    }

    const scopes = this.validateScope(client, data.scopes);
    const redirectTo = this.validateRedirectUri(data.redirect_uri, client);

    return new AuthenticationRequest({
      grantTypeId: this.getIdentifier(),
      client: client,
      redirectUri: redirectTo,
      state: data.state,
      nonce: data.nonce,
      scopes,
      responseMode: data.response_mode,
      responseType: data.response_type,
      ...(data.code_challenge &&
        data.code_challenge_method && {
          codeChallenge: data.code_challenge,
          codeChallengeMethod: data.code_challenge_method,
        }),
    });
  }

  async completeAuthRequest(
    authRequest: AuthenticationRequest,
  ): Promise<OAuthCodeEntity> {
    if (!authRequest.user)
      throw new RuntimeException(
        'An instance of User should be set on the AuthRequest',
      );

    if (authRequest.approved) {
      return this.issueAuthCode(
        authRequest.client,
        authRequest.user,
        authRequest.redirectUri,
        authRequest.scopes,
        authRequest.nonce,
      );
    }

    throw OAuthException.accessDenied('User denied the request');
  }

  async respondToAccessTokenRequest(
    req: Request,
    body: TokenDto,
  ): Promise<AccessTokenRequestResponse> {
    const client = await this.getClient(body, req);
    const authCode = await this.authCodeService.getFromCode(
      body.code,
      client,
      body.code_verifier,
    );
    const scopes = this.validateScope(client, body.scopes).filter(scope =>
      authCode.scopes.includes(scope),
    );

    if (authCode.clientId !== client.id) {
      this.logger.warn(
        `Authorization code ${authCode.id} do not belongs to the client ${client.id}`,
      );
      throw OAuthException.invalidRequest('code');
    }

    await this.validateRedirectUri(body.redirect_uri, client, authCode);

    return this.connection.transaction(async em => {
      const response = await this.returnAccessTokenResponse({
        em,
        user: authCode.user,
        client,
        body,
        scopes,
      });

      const authCodeRepo = em.getRepository(OAuthCodeEntity);
      await this.authCodeService.revoke(authCodeRepo, authCode);

      response.scopes = scopes;
      response.nonce = authCode.nonce;

      return response;
    });
  }

  protected async issueAuthCode(
    client: ClientEntity,
    user: UserEntity,
    redirectUri: string,
    scopes: string[],
    nonce?: string,
    repo?: Repository<OAuthCodeEntity>,
  ): Promise<OAuthCodeEntity> {
    return this.authCodeService.create(
      repo,
      client.id,
      user.id,
      scopes,
      redirectUri,
      this.config.get('oauth.authCodeTTL'),
      nonce,
    );
  }

  protected validateRedirectUri(
    uri: string,
    client: ClientEntity,
    authCode?: OAuthCodeEntity,
  ): string {
    if (
      (authCode && authCode.redirectUri !== uri) ||
      (authCode && client.redirectUrls && !client.redirectUrls.includes(uri))
    ) {
      this.logger.warn(
        `Redirect uri ${uri} do not match to one issued for code ${authCode.id}`,
      );
      throw OAuthException.invalidGrant();
    }

    return uri;
  }
}
