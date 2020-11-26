import {
  Controller,
  forwardRef,
  Get,
  Inject,
  Render,
  Req,
  Res, UseFilters, UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CurrentUser, ForbiddenExceptionCatcher } from '@iac-auth/core/auth';
import { classToPlain } from 'class-transformer';
import { UserEntity } from '@iac-auth/core/users/user.entity';
import { ClientService } from '@iac-auth/core/oauth2/modules';
import { isAdminGuard } from '@iac-auth/core/api/guards';

@Controller()
export class AppController {
  constructor(
    @Inject(forwardRef(() => ClientService))
    protected readonly clientService: ClientService,
  ) {}

  @Get('/index')
  @Render('index')
  async showIndex(
    @Req() req: any,
    @Res() res: Response,
    @CurrentUser() user?: UserEntity,
  ): Promise<any> {
    if (!user) return res.redirect('auth/login');

    return {
      user: classToPlain(user),
      csrfToken: req.csrfToken(),
      currentSession: req.session?.id,
      // sessionsList: sessionsList.slice(0, 5),
    };
  }

  @Get('manager*')
  @Render('index')
  @UseGuards(isAdminGuard)
  // @UseFilters(ForbiddenExceptionCatcher)
  async showManager(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user?: UserEntity,
  ): Promise<any> {
    if (!user) return res.redirect('auth/login?redirect_uri=/manager');

    return {
      user: classToPlain(user),
      csrfToken: req.csrfToken(),
      currentSession: req.session?.id,
    };
  }

  @Get('connection/:clientId')
  @Render('connection')
  async showConnectionInfo(
    @Req() request: Request,
    @Res() response: Response,
    @CurrentUser() user?: UserEntity,
  ): Promise<Record<any, any> | void> {
    if (!user)
      return response.redirect(
        `auth/login?redirect_uri=/connection/${request.params.clientId}`,
      );

    const client = await this.clientService.getItem(request.params.clientId);

    return {
      user: classToPlain(user),
      csrfToken: request.csrfToken(),
      currentSession: request.session?.id,
      client: classToPlain(client),
    };
  }
}
