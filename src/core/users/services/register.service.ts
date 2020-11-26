import { Injectable } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import { CypherService } from '@iac-auth/library/cypher';
import { Repository } from 'typeorm';
import { UserEntity } from '@iac-auth/core/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordService } from '@iac-auth/core/users/services/password.service';
import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
import { RegisterException } from '@iac-auth/core/auth/exceptions/register.exception';
import { RoleBasedService } from '@iac-auth/core/rb/services';

@Injectable()
export class RegisterService {
  constructor(
    private readonly configService: ConfigService,
    private readonly cypherService: CypherService,
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
    private readonly passwordService: PasswordService,
    private readonly roleBasedService: RoleBasedService,
  ) {}

  async register(data: Partial<UserEntity>): Promise<UserEntity> {
    const passwordStrengthVerify = this.passwordService.verifyStrength(
      data.password,
    );

    if (passwordStrengthVerify) {
      throw RegisterException.unsafePassword();
    }

    const emailIsUsed =
      (await this.repository.count({ email: data.email })) > 0;
    if (emailIsUsed) {
      throw RegisterException.alreadyTaken('Email');
    }

    const userNameIsUsed =
      (await this.repository.count({ username: data.username })) > 0;
    if (userNameIsUsed) {
      throw RegisterException.alreadyTaken('Username');
    }

    data.roles = data.roles && data.roles.length ? await this.roleBasedService.roleRepository.findByIds(data.roles) : [];

    return this.repository.save(
      this.repository.create({
        ...data,
      }),
    );
  }
}
