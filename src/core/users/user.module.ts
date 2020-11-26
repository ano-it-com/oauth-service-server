import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@iac-auth/core/users/user.entity';
import { SignModule } from '@iac-auth/library/sign/sign.module';
import { CypherModule } from '@iac-auth/library/cypher';
import { UserService } from '@iac-auth/core/users/services/user.service';
import { RegisterService } from '@iac-auth/core/users/services/register.service';
import { PasswordService } from '@iac-auth/core/users/services/password.service';
import { UserController } from '@iac-auth/core/users/controllers';
import { RbModule } from '@iac-auth/core/rb/rb.module';
import { UserTasksService } from '@iac-auth/core/users/services/user.tasks.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UserEntity]),
    SignModule.register({
      secret: process.env.SIGN_SECRET_KEY || 'secretketforsign',
      ttl: parseInt(process.env.SIGN_TTL) || 60 * 60 * 24,
    }),
    CypherModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('crypto'),
    }),
    forwardRef(() => RbModule),
  ],
  providers: [UserService, RegisterService, PasswordService, UserTasksService],
  controllers: [UserController],
  exports: [UserService, RegisterService, UserTasksService],
})
export class UserModule {}
