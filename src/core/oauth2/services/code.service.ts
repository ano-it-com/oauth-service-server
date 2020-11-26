import { Injectable } from '@nestjs/common';
import { OAuthService } from '@iac-auth/core/oauth2/services/oauth.service';
import { AuthorizationDto } from '@iac-auth/core/oauth2/dto';
import { UserEntity } from '@iac-auth/core/users/user.entity';
import { OAuthException } from '@iac-auth/core/oauth2/exceptions';
import { AuthenticationRequest } from '@iac-auth/core/oauth2/authentication.request';
import { AuthCodeResponse } from '@iac-auth/core/oauth2/interfaces';
import { ClientEntity } from '@iac-auth/core/oauth2/client.entity';
import { MoreThan } from 'typeorm';
import { OAuthAccessTokenEntity } from '@iac-auth/core/oauth2/oauth-access-token.entity';
import { TokenAuthMethod } from '@iac-auth/core/oauth2/const';

@Injectable()
export class CodeService extends OAuthService {
  public async validateAuthorizationRequest(
    query: AuthorizationDto,
    user: UserEntity,
  ): Promise<any> {
    const grant = this.grants.find(grant =>
      grant.canRespondToAuthorizationRequest(query),
    );
    if (!grant) throw OAuthException.unsupportedGrantType();

    const authRequest = await grant.createAuthRequest(query);
    const alreadyAllowed = (authRequest.client.acceptedUsers || []).find(
      _ => _.id === user.id,
    );
    const validToken = await this.findValidToken(
      user,
      authRequest.client,
      authRequest.scopes,
    );

    return {
      authRequest,
      skip:
        alreadyAllowed ||
        (validToken &&
          authRequest.scopes.every(scope =>
            validToken.scopes.includes(scope),
          )) ||
        authRequest.client.firstParty,
    };
  }

  public async completeAuthorizationRequest(
    authRequest: AuthenticationRequest,
    user: UserEntity,
    approved: boolean,
  ): Promise<AuthCodeResponse> {
    const grant = this.grants.find(
      grant => grant.getIdentifier() === authRequest.grantTypeId,
    );
    if (!grant) throw OAuthException.unsupportedGrantType();

    authRequest.user = user;
    authRequest.approved = approved;

    const authCode = await grant.completeAuthRequest(authRequest);
    const code = this.cypherService.encrypt(
      authCode.toPayload(
        authRequest.codeChallenge,
        authRequest.codeChallengeMethod,
      ),
    );

    return {
      code,
      returnTo: authRequest.redirectUri,
      state: authRequest.state,
    };
  }

  public async addAllowedClient(user: UserEntity, client: any): Promise<any> {
    const clientEntity = await this.clientService.getClient({
      clientId: client.id,
      clientSecret: client.secret,
      type: TokenAuthMethod.client_secret_post,
    });

    const acceptedList = clientEntity.acceptedUsers || [];
    acceptedList.push(user);
    clientEntity.acceptedUsers = acceptedList;
    const updated = await this.clientService.update(clientEntity.id, {
      acceptedUsers: clientEntity.acceptedUsers,
    });
    return updated;
  }

  public async findValidToken(
    user: UserEntity,
    client: ClientEntity,
    scopes: string[],
  ): Promise<OAuthAccessTokenEntity> {
    return this.accessTokenRepository
      .createQueryBuilder('token')
      .where({
        clientId: client.id,
        userId: user.id,
        revoked: false,
        expiresAt: MoreThan(new Date()),
      })
      .andWhere('token.scopes @> :scopes', { scopes })
      .getOne();
  }
}
