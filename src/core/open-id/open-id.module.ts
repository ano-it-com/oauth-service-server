import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import { AuthModule } from '@iac-auth/core/auth';
import { JwtModule } from '@iac-auth/library/jwt';
import { OpenIdService } from '@iac-auth/core/open-id/services';
import {
  UserInfoController,
  WellKnowController,
} from '@iac-auth/core/open-id/controllers';

@Module({
  imports: [ConfigModule, AuthModule, JwtModule],
  providers: [OpenIdService],
  controllers: [WellKnowController, UserInfoController],
})
export class OpenIdModule {}
