import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '@iac-auth/core/users';
import {
  CertKeysController,
  ClientsController,
  RolesController,
  StatisticController,
  UsersController,
} from '@iac-auth/core/api/controllers';
import { CommonModule } from '@iac-auth/core/oauth2/modules';
import { OAuth2Module } from '@iac-auth/core/oauth2';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyEntity } from '@iac-auth/core/oauth2/key.entity';
import { RbModule } from '@iac-auth/core/rb/rb.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => CommonModule),
    forwardRef(() => OAuth2Module),
    forwardRef(() => RbModule),
    TypeOrmModule.forFeature([KeyEntity]),
  ],
  controllers: [
    StatisticController,
    UsersController,
    ClientsController,
    CertKeysController,
    RolesController,
  ],
})
export class ApiModule {}
