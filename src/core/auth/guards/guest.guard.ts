import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { GuestException } from '@iac-auth/core/auth/exceptions/guest.exception';

@Injectable()
export class GuestGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    if (request.user) {
      throw new GuestException();
    }

    return true;
  }
}
