import { NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void): any {
    console.log('Request', req.method, req.originalUrl, /*...*/);
    next();
    console.log('Response', res.statusCode, res.statusMessage, /*...*/);
  }
}
