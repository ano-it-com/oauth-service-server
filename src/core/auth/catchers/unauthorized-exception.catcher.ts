import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginDto } from '@iac-auth/core/auth';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionCatcher implements ExceptionFilter {
  catch(
    exception: UnauthorizedException,
    host: ArgumentsHost,
    urlOverride?: string,
  ): void {
    const res = host.switchToHttp().getResponse<Response>();
    const req = host
      .switchToHttp()
      .getRequest<Request<any, any, any, LoginDto>>();

    const qs = new URLSearchParams(req.url);
    let url = req.url;
    if (qs.has('/auth/login?redirect_uri')) {
      url = qs.get('/auth/login?redirect_uri');
    }

    const params: string =
      '&email=' +
      encodeURIComponent(req.body.email) +
      '&error=' +
      encodeURIComponent(JSON.stringify(exception.getResponse()));
    res.redirect(
      '/auth/login?redirect_uri=' +
        encodeURIComponent(urlOverride || url) +
        params,
    );
  }
}
