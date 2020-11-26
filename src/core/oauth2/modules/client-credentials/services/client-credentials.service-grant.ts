import { AbstractGrant } from '@iac-auth/core/oauth2/modules/common';
import { TokenDto } from '@iac-auth/core/oauth2/dto';
import { AccessTokenRequestResponse } from '@iac-auth/core/oauth2/interfaces';
import { Request } from 'express';
import { InjectableGrant } from '@iac-auth/core/oauth2/modules/common/decorators/injectable.grant.decorator';
import { GrantTypes } from '@iac-auth/core/oauth2/const';

@InjectableGrant(GrantTypes.client_credentials)
export class ClientCredentialsServiceGrant extends AbstractGrant {
  async respondToAccessTokenRequest(
    req: Request,
    body: TokenDto,
  ): Promise<AccessTokenRequestResponse> {
    const client = await this.getClient(body, req);

    return this.connection.transaction(async em =>
      this.returnAccessTokenResponse({ em, client, body }),
    );
  }
}
