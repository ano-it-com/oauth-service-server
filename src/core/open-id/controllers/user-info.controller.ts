import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AccessToken, CurrentUser, JwtGuard } from '@iac-auth/core/auth';
import { UserEntity } from '@iac-auth/core/users/user.entity';
import { AccessTokenJwtPayload } from '@iac-auth/core/oauth2/interfaces';
import { Scopes } from '@iac-auth/core/oauth2/const';
import OpenIdException from '@iac-auth/core/open-id/exceptions';

@Controller('user-info')
export class UserInfoController {
  @UseGuards(JwtGuard)
  @Get()
  @Post()
  async userInfo(
    @CurrentUser() user: UserEntity,
    @AccessToken() token: AccessTokenJwtPayload,
  ): Promise<Record<any, any>> {
    if (user.bannedAt) {
      throw OpenIdException.accountSuspended();
    }

    return user.toOpenIdProfile((token.scopes || []) as Scopes[]);
  }
}
