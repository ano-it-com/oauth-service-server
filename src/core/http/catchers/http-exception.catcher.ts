import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionCatcher implements ExceptionFilter {
  public catch(exception: any, host: ArgumentsHost): any {
    const response: Response = host.switchToHttp().getResponse();
    const request: Request = host.switchToHttp().getRequest();

    if (!request.accepts().includes('application/json')) {
      const status = exception.getStatus() || 500;

      return response.status(status).render(`error-${status}`);
    }

    return response.status(exception.getStatus()).json(exception.getResponse());
  }
}
