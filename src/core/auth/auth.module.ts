import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@iac-auth/core/users/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@iac-auth/library/jwt';
import { UserModule } from '@iac-auth/core/users/user.module';
import { SessionSerializer } from '@iac-auth/core/auth/serializers';
import { JwtStrategy, LocalStrategy } from '@iac-auth/core/auth/strategies';
import {
  AuthenticatedGuard,
  GuestGuard,
  JwtGuard,
  LoginGuard,
} from '@iac-auth/core/auth/guards';
import { APP_FILTER } from '@nestjs/core';
import { GuestExceptionCatcher } from '@iac-auth/core/auth/catchers';
import {
  LoginController,
  LogoutController,
  RegisterController,
} from '@iac-auth/core/auth/controllers';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule.register({
      session: true,
      defaultStrategy: 'local',
    }),
    JwtModule,
    forwardRef(() => UserModule),
  ],
  providers: [
    SessionSerializer,
    LocalStrategy,
    JwtStrategy,
    LoginGuard,
    AuthenticatedGuard,
    GuestGuard,
    JwtGuard,
    {
      provide: APP_FILTER,
      useClass: GuestExceptionCatcher,
    },
  ],
  controllers: [LoginController, RegisterController, LogoutController],
  exports: [GuestGuard, LoginGuard, AuthenticatedGuard],
})
export class AuthModule {}
