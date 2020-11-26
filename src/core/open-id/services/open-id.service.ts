import { Injectable } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import { OpenIdConfig } from '@iac-auth/core/open-id/open-id.config';

@Injectable()
export class OpenIdService {
  constructor(private readonly config: ConfigService) {}

  getConfig(): OpenIdConfig {
    const appUrl = this.config.get('application.url');
    const openIdConfig = new OpenIdConfig(appUrl);

    return openIdConfig;
  }
}
