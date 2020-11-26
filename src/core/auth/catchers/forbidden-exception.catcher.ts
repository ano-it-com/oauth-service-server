import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(ForbiddenException)
export class ForbiddenExceptionCatcher implements ExceptionFilter {
  catch(
    exception: ForbiddenException,
    host: ArgumentsHost,
    urlOverride?: string,
  ): void {
    const res = host.switchToHttp().getResponse<Response>();
    const req = host.switchToHttp().getRequest<Request>();

    if (req.user) {
      req.logout();
    }

    res.redirect(
      '/auth/login?redirect_uri=' + encodeURIComponent(urlOverride || req.url),
    );
  }
}
