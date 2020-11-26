import { Module } from '@nestjs/common';
import { CommonModule } from '@iac-auth/core/oauth2/modules/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthCodeEntity } from '@iac-auth/core/oauth2/oauth-code.entity';
import {
  AuthCodeService,
  AuthorizationCodeServiceGrant,
} from '@iac-auth/core/oauth2/modules/authorization-code/services';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([OAuthCodeEntity])],
  providers: [AuthCodeService, AuthorizationCodeServiceGrant],
})
export class AuthorizationCodeModule {}
