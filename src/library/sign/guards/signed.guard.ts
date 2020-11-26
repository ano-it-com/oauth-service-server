import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  GoneException,
  Injectable,
} from '@nestjs/common';
import { UrlSignService } from '@iac-auth/library/sign/services';
import { Request } from 'express';
import { VerifyResult } from 'signed';

@Injectable()
export class SignedGuard implements CanActivate {
  constructor(private readonly urlSignService: UrlSignService) {}

  /**
   * @param context
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    switch (this.urlSignService.verifyRequest(request)) {
      case VerifyResult.expired:
        throw new GoneException();
      case VerifyResult.blackholed:
        throw new ForbiddenException();
      case VerifyResult.ok:
        return true;
    }

    return true;
  }
}
