import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm/index';
import { UserEntity } from '@iac-auth/core/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import each from 'lodash/each';
import { LdapClient } from '@iac-auth/utils/ldap.client';

@Injectable()
export class UserTasksService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  @Cron(CronExpression.EVERY_2_HOURS)
  private async syncBannedUsersFromLDAP(): Promise<void>  {
    const users = await this.userRepository.find({ where: { fromLDAP: true }, relations: ['bannedBy'] });
    const anyAdmin = await this.userRepository.findOne({ where: { isSSOAdmin: true }});

    const client = new LdapClient({
      url: process.env.LDAP_URL,
    }, process.env.LDAP_DNU, process.env.LDAP_CREDENTIALS_PASSWORD);

    each(users, async (user) => {
      const entry = await client.searchUser(user.username, ['nsAccountLock']);
      if (!entry) return;

      const nsAccountLock = entry.object.nsAccountLock;

      const value = nsAccountLock == 'TRUE';

      if (!!user.bannedBy === value) return;

      user.bannedBy = value ? anyAdmin : null;
      user.bannedAt = value ? new Date() : null;

      await this.userRepository.save(user);
    });
  }
}
