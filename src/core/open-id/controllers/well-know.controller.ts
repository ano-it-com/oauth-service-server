import { Controller, Get } from '@nestjs/common';
import { OpenIdService } from '@iac-auth/core/open-id/services';
import { JwtService } from '@iac-auth/library/jwt';
import { OpenIdConfig } from '@iac-auth/core/open-id/open-id.config';
import { JSONWebKeySet } from 'jose';

@Controller('.well-known')
export class WellKnowController {
  constructor(
    private readonly openIdService: OpenIdService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('openid-configuration')
  getOpenIdConfiguration(): OpenIdConfig {
    return this.openIdService.getConfig();
  }

  @Get('jwks.json')
  async getJwks(): Promise<JSONWebKeySet> {
    return this.jwtService.jwks(undefined, 'public');
  }
}
