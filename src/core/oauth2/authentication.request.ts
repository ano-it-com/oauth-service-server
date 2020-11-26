import { UserEntity } from '@iac-auth/core/users/user.entity';
import {
  GrantTypes,
  ResponseModes,
  ResponseTypes,
} from '@iac-auth/core/oauth2/const';
import { ClientEntity } from '@iac-auth/core/oauth2/client.entity';

export class AuthenticationRequest {
  public user: UserEntity;
  public approved = false;
  public readonly codeChallenge: any;
  public readonly codeChallengeMethod: any;
  public readonly grantTypeId: GrantTypes;
  public readonly client: ClientEntity;
  public readonly redirectUri: string;
  public scopes: string[];
  public readonly state: string;
  public readonly nonce: string;
  public readonly responseMode: ResponseModes = ResponseModes.query;
  public readonly responseType: ResponseTypes = ResponseTypes.code;

  constructor(partial: Partial<AuthenticationRequest>) {
    Object.assign(this, partial);
  }
}
