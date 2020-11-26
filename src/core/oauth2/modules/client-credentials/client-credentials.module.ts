import { Module } from '@nestjs/common';
import { CommonModule } from '@iac-auth/core/oauth2/modules/common';
import { ClientCredentialsServiceGrant } from '@iac-auth/core/oauth2/modules/client-credentials/services';

@Module({
  imports: [CommonModule],
  providers: [ClientCredentialsServiceGrant],
  exports: [ClientCredentialsServiceGrant],
})
export class ClientCredentialsModule {}
