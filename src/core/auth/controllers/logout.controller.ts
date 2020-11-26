import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('auth')
export class LogoutController {
  @Post('logout')
  logout(
    @Req() request: Request,
    @Res() response: Response,
    @Body('redirect_uri') redirectTo: string,
    @Query('redirect_uri') redirectToQ: string,
  ): void {
    request.logOut();
    response.redirect(redirectTo || redirectToQ || '/');
  }

  @Get('logout')
  logoutGet(
    @Req() request: Request,
    @Res() response: Response,
    @Body('redirect_uri') redirectTo: string,
    @Query('redirect_uri') redirectToQ: string,
  ): void {
    request.logOut();
    response.redirect(redirectTo || redirectToQ || '/');
  }
}
