import { Module } from '@nestjs/common';
import { CommonModule } from '@iac-auth/core/oauth2/modules/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@iac-auth/core/users/user.entity';
import { PasswordServiceGrant } from '@iac-auth/core/oauth2/modules/password/services';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([UserEntity])],
  providers: [PasswordServiceGrant],
  exports: [PasswordServiceGrant],
})
export class PasswordModule {}
