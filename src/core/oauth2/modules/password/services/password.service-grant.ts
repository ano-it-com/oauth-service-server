import { AbstractGrant } from '@iac-auth/core/oauth2/modules/common';
import { InjectableGrant } from '@iac-auth/core/oauth2/modules/common/decorators/injectable.grant.decorator';
import { GrantTypes } from '@iac-auth/core/oauth2/const';
import { Repository } from 'typeorm';
import { UserEntity } from '@iac-auth/core/users/user.entity';
import { Request } from 'express';
import { TokenDto } from '@iac-auth/core/oauth2/dto';
import { AccessTokenRequestResponse } from '@iac-auth/core/oauth2/interfaces';
import { OAuthException } from '@iac-auth/core/oauth2/exceptions';
import { InjectRepository } from '@nestjs/typeorm';

@InjectableGrant(GrantTypes.password)
export class PasswordServiceGrant extends AbstractGrant {
  constructor(
    @InjectRepository(UserEntity)
    protected readonly userRepository: Repository<UserEntity>,
  ) {
    super();
  }

  async respondToAccessTokenRequest(
    req: Request,
    body: TokenDto,
  ): Promise<AccessTokenRequestResponse> {
    const client = await this.getClient(body, req);
    const user = await this.getUser(body);

    return this.connection.transaction(async em =>
      this.returnAccessTokenResponse({ em, user, client, body }),
    );
  }

  protected async getUser({
    username,
    password,
  }: TokenDto): Promise<UserEntity> {
    if (!username) {
      throw OAuthException.invalidRequest('username');
    }

    if (!password) {
      throw OAuthException.invalidRequest('password');
    }

    const user = await this.userRepository.findOne({
      email: username,
    });

    if (!user || !(await user.validatePassword(password))) {
      this.logger.warn(`Invalid user credentials`);
      throw OAuthException.invalidGrant();
    }

    return user;
  }
}
