import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookie = createParamDecorator(
  (cookieName: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (cookieName) {
      return request.cookies[cookieName] || request.signedCookies[cookieName];
    }

    return {
      ...request.cookies,
      ...request.signedCookies,
    };
  },
);
