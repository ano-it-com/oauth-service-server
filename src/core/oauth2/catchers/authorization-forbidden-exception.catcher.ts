import { ForbiddenExceptionCatcher } from '@iac-auth/core/auth/catchers/forbidden-exception.catcher';
import * as qs from 'querystring';
import { ArgumentsHost, ForbiddenException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthorizationDto } from '@iac-auth/core/oauth2/dto';
import { PromptTypes } from '@iac-auth/core/oauth2/const';

export class AuthorizationForbiddenExceptionCatcher extends ForbiddenExceptionCatcher {
  catch(exception: ForbiddenException, host: ArgumentsHost): any {
    const res = host.switchToHttp().getResponse<Response>();
    const req = host
      .switchToHttp()
      .getRequest<Request<any, any, any, AuthorizationDto>>();

    /**
     * If prompt=none, redirect to the redirect_uri with error
     */
    if (req.query.prompt === PromptTypes.none) {
      const url = new URL(req.query.redirect_uri);
      url.search = qs.stringify({
        error: 'login_required',
      });
      return res.redirect(url.toString());
      /**
       * If prompt=login the guard has correctly logged out the user (@see AuthorizeGuard)
       * We need to replace prompt=login with the default consent, otherwise it end in a login form loop
       * (The guard will see again prompt=login, will log out the user and so on)
       */
    } else if (req.query.prompt === PromptTypes.login) {
      const [baseUrl] = req.originalUrl.split('?');
      const newQuery = { ...req.query };
      newQuery.prompt = PromptTypes.consent;

      return super.catch(
        exception,
        host,
        `${baseUrl}?${qs.stringify(newQuery)}`,
      );
    }

    return super.catch(exception, host);
  }
}
