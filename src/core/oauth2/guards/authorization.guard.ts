import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthenticatedGuard } from '@iac-auth/core/auth/guards/authenticated.guard';
import { Request } from 'express';
import { AuthorizationDto } from '@iac-auth/core/oauth2/dto';
import { PromptTypes } from '@iac-auth/core/oauth2/const';

@Injectable()
export class AuthorizationGuard extends AuthenticatedGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request<any, any, any, AuthorizationDto>>();
    const { query } = request;

    if (query.prompt === PromptTypes.login) request.logout();

    return super.canActivate(context);
  }
}
