import { CodeService } from '@iac-auth/core/oauth2/services';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  Session,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  AuthorizationForbiddenExceptionCatcher,
  OAuthExceptionCatcher,
  RFC6749ExceptionCatcher,
} from '@iac-auth/core/oauth2/catchers';
import { AuthorizationDto, ConsentDto } from '@iac-auth/core/oauth2/dto';
import { CurrentUser } from '@iac-auth/core/auth/decorators';
import { UserEntity } from '@iac-auth/core/users/user.entity';
import { Request, Response } from 'express';
import {
  getAuthRequestFromSession,
  handleResponseMode,
} from '@iac-auth/core/oauth2/response-mode.handler';
import { PromptTypes } from '@iac-auth/core/oauth2/const';
import { ClientAuthGuard } from '@iac-auth/core/oauth2/guards/client-auth.guard';
import { PkceGuard } from '@iac-auth/core/oauth2/guards/pkce.guard';
import { AuthorizationGuard } from '@iac-auth/core/oauth2/guards/authorization.guard';
import { classToPlain } from 'class-transformer';

@UseFilters(
  RFC6749ExceptionCatcher,
  AuthorizationForbiddenExceptionCatcher,
  OAuthExceptionCatcher,
)
@Controller('oauth2')
export class AuthorizationController {
  constructor(private readonly service: CodeService) {}

  @UseGuards(AuthorizationGuard, ClientAuthGuard(false), PkceGuard('challenge'))
  @Get('authorize')
  async showAuthorizeForm(
    @Query() query: AuthorizationDto,
    @CurrentUser() user: UserEntity,
    @Session() session: any,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    const {
      authRequest,
      skip,
    } = await this.service.validateAuthorizationRequest(query, user);

    if (skip) {
      const {
        returnTo,
        state,
        code,
      } = await this.service.completeAuthorizationRequest(
        authRequest,
        user,
        true,
      );
      return handleResponseMode(res, authRequest.responseMode, returnTo, {
        state,
        code,
      });
    } else if (query.prompt === PromptTypes.none) {
      return handleResponseMode(res, query.response_mode, query.redirect_uri, {
        error: 'interaction_required',
        state: query.state,
      });
    }

    session.authRequest = authRequest;

    return res.render('index', {
      client: authRequest.client,
      user: classToPlain(user),
      scopes: authRequest.scopes,
      csrfToken: req.csrfToken(),
    });
  }

  @UseGuards(AuthorizationGuard)
  @Post('accept')
  async accept(
    @Session() session: any,
    @CurrentUser() user: UserEntity,
    @Body() data: ConsentDto,
    @Res() res: Response,
  ): Promise<any> {
    const authRequest = getAuthRequestFromSession(session);

    authRequest.scopes = (data.scopes || []).filter(Boolean);

    await this.service.addAllowedClient(user, authRequest.client);

    const {
      returnTo,
      state,
      code,
    } = await this.service.completeAuthorizationRequest(
      authRequest,
      user,
      true,
    );
    return handleResponseMode(res, authRequest.responseMode, returnTo, {
      state,
      code,
    });
  }

  @UseGuards(AuthorizationGuard)
  @Post('deny')
  async deny(
    @Session() session: any,
    @CurrentUser() user: UserEntity,
    @Body() data: ConsentDto,
    @Res() res: Response,
  ): Promise<any> {
    const authRequest = getAuthRequestFromSession(session);

    return handleResponseMode(
      res,
      authRequest.responseMode,
      authRequest.redirectUri,
      {
        error: 'access_denied',
        error_description: 'The user denied the request',
        state: authRequest.state,
      },
    );
  }
}
