import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { OAuthException } from '@iac-auth/core/oauth2/exceptions';
import { Response } from 'express';

@Catch(HttpException)
export class RFC6749ExceptionCatcher implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): any {
    let authException: OAuthException;

    if (!(exception instanceof OAuthException)) {
      const [error, description] = this.getErrorAndDescription(exception);

      authException = new OAuthException(
        error,
        description,
        exception.getStatus(),
      );
    } else {
      authException = exception;
    }

    const response = host.switchToHttp().getResponse<Response>();

    return response
      .status(authException.getStatus())
      .json(authException.getResponse());
  }

  private getErrorAndDescription(exception: HttpException) {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      const error = response;
      const description = exception.message;
      return [error, description !== error ? description : undefined];
    }

    if (Array.isArray((response as any).message)) {
      // Validation error
      return ['invalid_request', (response as any).message[0]];
    }

    return [
      (response as any).message || exception.message,
      (response as any).error,
    ];
  }
}
