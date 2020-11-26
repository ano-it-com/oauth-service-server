import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { memoize } from '@nestjs/passport/dist/utils/memoize.util';
import { Request } from 'express';
import { ClientEntity } from '@iac-auth/core/oauth2/client.entity';
import { TokenAuthMethod } from '@iac-auth/core/oauth2/const';
import { OAuthException } from '@iac-auth/core/oauth2/exceptions';

export type IPkceGuard = CanActivate;

export const PkceGuard: (
  step: 'challenge' | 'verifier',
) => Type<IPkceGuard> = memoize(createPkceGuard);

function createPkceGuard(step: 'challenge' | 'verifier'): Type<IPkceGuard> {
  class MixinPkceGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      if (!request.client) return false;

      const client: ClientEntity = request.client;
      switch (step) {
        case 'challenge':
          if (client.canHandleAuthMethod(TokenAuthMethod.none)) {
            if (
              !request.query.code_challenge ||
              !request.query.code_challenge_method
            ) {
              throw OAuthException.invalidRequest('code_challenge');
            }
          }

          return true;
        case 'verifier':
          if (client.canHandleAuthMethod(TokenAuthMethod.none)) {
            if (!request.body.code_verifier) {
              throw OAuthException.invalidRequest('code_verifier');
            }
          }

          return true;
      }
    }
  }

  const guard = mixin(MixinPkceGuard);
  return guard;
}
