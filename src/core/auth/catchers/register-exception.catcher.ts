import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RegisterException } from '@iac-auth/core/auth/exceptions/register.exception';
import { Request, Response } from 'express';
import { RegisterDto } from '@iac-auth/core/auth';

@Catch(RegisterException)
export class RegisterExceptionCatcher implements ExceptionFilter {
  catch(
    exception: RegisterException,
    host: ArgumentsHost,
    urlOverride?: string,
  ): any {
    const res = host.switchToHttp().getResponse<Response>();
    const req = host
      .switchToHttp()
      .getRequest<Request<any, any, any, RegisterDto>>();

    const qs = new URLSearchParams(req.url);
    let url = req.url;
    if (qs.has('/auth/register?redirect_uri')) {
      url = qs.get('/auth/register?redirect_uri');
    }

    const params: string =
      '&email=' +
      encodeURIComponent(req.body.email) +
      '&firstName=' +
      encodeURIComponent(req.body.firstName) +
      '&lastName=' +
      encodeURIComponent(req.body.lastName) +
      '&error=' +
      encodeURIComponent(JSON.stringify(exception.getResponse()));
    res.redirect(
      '/auth/register?redirect_uri=' +
        encodeURIComponent(urlOverride || url) +
        params,
    );
  }
}
