import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { handleResponseMode } from '@iac-auth/core/oauth2/response-mode.handler';
import { ResponseModes } from '@iac-auth/core/oauth2/const';
import { OAuthException } from '@iac-auth/core/oauth2';

@Catch(OAuthException)
export class OAuthExceptionCatcher implements ExceptionFilter {
  catch(exception: OAuthException, host: ArgumentsHost): Response | void {
    const req = host.switchToHttp().getRequest<Request>();
    const res = host.switchToHttp().getResponse<Response>();

    if (req.query.response_mode) {
      return handleResponseMode(
        res,
        req.query.response_mode as ResponseModes,
        req.query.redirect_uri as string,
        exception.getResponse() as Record<string, any>,
      );
    }

    return res.status(exception.getStatus()).json(exception.getResponse());
  }
}
