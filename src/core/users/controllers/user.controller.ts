import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { SignedGuard } from '@iac-auth/library/sign/guards';
import { CurrentUser, JwtGuard } from '@iac-auth/core/auth';
import { UserEntity } from '@iac-auth/core/users/user.entity';
import { Response } from 'express';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  @Get('me')
  public async me(
    @Res() response: Response,
    @CurrentUser() user?: UserEntity,
  ): Promise<Response> {
    return response.status(200).json(user);
  }
}
