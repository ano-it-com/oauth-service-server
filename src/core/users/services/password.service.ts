import { Injectable } from '@nestjs/common';
import zxcvbn from 'zxcvbn';
import { ConfigService } from 'nestjs-config';

@Injectable()
export class PasswordService {
  constructor(private readonly configService: ConfigService) {}

  verifyStrength(password: string): void | string {
    const result = zxcvbn(password);
    if (
      result.score <
      this.configService.get('application.security.password.minSecureScore')
    ) {
      return result.feedback.warning || result.feedback.suggestions[0];
    }

    return null;
  }
}
