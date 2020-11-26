import { TokenService } from '@iac-auth/core/oauth2/services';
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { OAuthExceptionCatcher } from '@iac-auth/core/oauth2/catchers/oauth-exception.catcher';
import { RFC6749ExceptionCatcher } from '@iac-auth/core/oauth2/catchers';
import { Request } from 'express';
import { IntrospectDto, TokenDto } from '@iac-auth/core/oauth2/dto';
import { ClientAuthGuard } from '@iac-auth/core/oauth2/guards/client-auth.guard';
import { PkceGuard } from '@iac-auth/core/oauth2/guards/pkce.guard';
import { OAuthException } from '@iac-auth/core/oauth2/exceptions';

@UseFilters(RFC6749ExceptionCatcher, OAuthExceptionCatcher)
@Controller('oauth2')
export class TokenController {
  constructor(private readonly service: TokenService) {}

  @UseGuards(ClientAuthGuard(), PkceGuard('verifier'))
  @Post('token')
  issueAccessToken(@Req() req: Request, @Body() data: TokenDto): any {
    return this.service.respondToAccessTokenRequest(req, data);
  }

  /**
   * Get information about access and refresh tokens
   * @param data
   */
  @UseGuards(ClientAuthGuard())
  @Post('introspect')
  tokenInfo(@Body() data: IntrospectDto): any {
    return this.service.verifyToken(data.token, data.token_type_hint);
  }

  @UseGuards(ClientAuthGuard())
  @HttpCode(200)
  @Post('revoke')
  async revokeToken(@Body() data: IntrospectDto): Promise<void> {
    const { token } = await this.service.decryptToken(
      data.token,
      data.token_type_hint,
    );
    if (!token) throw OAuthException.invalidRequest('token');

    await this.service.revokeToken(token);
    return null;
  }
}
