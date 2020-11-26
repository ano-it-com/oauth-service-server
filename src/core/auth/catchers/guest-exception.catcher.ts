import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { GuestException } from '@iac-auth/core/auth/exceptions/guest.exception';
import { Request, Response } from 'express';

@Catch(GuestException)
export class GuestExceptionCatcher implements ExceptionFilter {
  catch(exception: GuestException, host: ArgumentsHost): any {
    const req = host.switchToHttp().getRequest<Request>();
    const res = host.switchToHttp().getResponse<Response>();

    res.redirect(<string>req.query.redirect_uri || '/');
  }
}
