import { Module } from '@nestjs/common';
import { CommonModule } from '@iac-auth/core/oauth2/modules/common';
import { RefreshTokenServiceGrant } from '@iac-auth/core/oauth2/modules/refresh-token/services';

@Module({
  imports: [CommonModule],
  providers: [RefreshTokenServiceGrant],
  exports: [RefreshTokenServiceGrant],
})
export class RefreshTokenModule {}
