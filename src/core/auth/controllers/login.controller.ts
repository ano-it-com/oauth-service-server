import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Render,
  Req,
  Res,
  Session,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { GuestGuard, LoginGuard } from '@iac-auth/core/auth/guards';
import { LoginDto } from '@iac-auth/core/auth/dto';
import { CurrentUser } from '@iac-auth/core/auth/decorators';
import { UserEntity } from '@iac-auth/core/users/user.entity';
import { Request, Response } from 'express';
import { UnauthorizedExceptionCatcher } from '@iac-auth/core/auth/catchers/unauthorized-exception.catcher';

@UseGuards(GuestGuard)
@Controller('auth')
@UseFilters(UnauthorizedExceptionCatcher)
export class LoginController {
  @UseGuards(LoginGuard)
  @Post('login')
  login(
    @Body() data: LoginDto,
    @CurrentUser() user: UserEntity,
    @Session() session: any,
    @Query('redirect_uri') intended: string,
    @Res() response: Response,
    @Req() request: Request,
  ): Response | void {
    if (data.remember) {
      session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    } else {
      session.cookie.expires = false;
    }

    if (request.accepts().includes('application/json')) {
      return response.json({
        returnTo: intended || '/',
      });
    }

    response.redirect(intended || '/');
  }

  @Get('login')
  @Render('index')
  showLogin(@Req() request: Request): any {
    return {
      csrfToken: request.csrfToken(),
    };
  }
}
