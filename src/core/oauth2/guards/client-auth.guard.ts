import {
  CanActivate,
  ExecutionContext,
  Inject,
  mixin,
  Type,
} from '@nestjs/common';
import { ClientService } from '@iac-auth/core/oauth2/modules/common';
import { Request } from 'express';

export type IClientAuthGuard = CanActivate;

export const ClientAuthGuard: (
  validateSecret?: boolean,
) => Type<IClientAuthGuard> = createClientAuthGuard;

function createClientAuthGuard(validateSecret = true): Type<IClientAuthGuard> {
  class MixinClientAuthGuard implements CanActivate {
    constructor(
      @Inject(ClientService)
      private readonly clientService: ClientService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      const isGet = request.method === 'GET';
      const client = await this.clientService.getClient(
        this.clientService.getClientCredentials(
          isGet ? request.query : request.body,
          !isGet && request.headers,
        ),
        validateSecret,
      );

      request.client = client; //cache

      return !!client;
    }
  }

  const guard = mixin(MixinClientAuthGuard);
  return guard;
}
