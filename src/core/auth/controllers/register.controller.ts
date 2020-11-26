import {
  Body,
  Controller,
  forwardRef,
  Get,
  Inject,
  Post,
  Query,
  Render,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { GuestGuard } from '@iac-auth/core/auth/guards';
import { RegisterService } from '@iac-auth/core/users/services/register.service';
import { Request, Response } from 'express';
import { RegisterDto } from '@iac-auth/core/auth/dto';
import { RegisterExceptionCatcher } from '@iac-auth/core/auth/catchers/register-exception.catcher';

@UseGuards(GuestGuard)
@Controller('auth')
@UseFilters(RegisterExceptionCatcher)
export class RegisterController {
  constructor(
    @Inject(forwardRef(() => RegisterService))
    private readonly registerService: RegisterService,
  ) {}

  @Post('register')
  async register(
    @Body() data: RegisterDto,
    @Query('redirect_uri') intended: string,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<Promise<Response> | void> {
    const user = await this.registerService.register(data);

    await new Promise((resolve, reject) =>
      request.logIn(
        {
          user,
          info: {
            ip: request.ip,
            userAgent: request.headers['user-agent'],
          },
        },
        error => {
          if (error) return reject(error);
          resolve();
        },
      ),
    );

    if (request.accepts().includes('application/json')) {
      return response.status(200).json({
        returnTo: intended || '/',
      });
    }

    response.redirect(intended || '/');
  }

  @Get('register')
  @Render('index')
  showRegister(@Req() request: Request): any {
    return {
      csrfToken: request.csrfToken(),
    };
  }
}
