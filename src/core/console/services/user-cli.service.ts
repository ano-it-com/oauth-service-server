import { Command, Console } from 'nestjs-console';
import { UserService } from '@iac-auth/core/users';
import { UserEntity } from '@iac-auth/core/users/user.entity';

@Console({
  name: 'users',
  description: 'Managing users',
})
export class UserCliService {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Command({
    command: 'mark-as-sso-admin <userId>',
    description: 'Mark user as SSOAdmin',
  })
  async markUserAsSSOAdmin(userId: string): Promise<void> {
    const user = await this.userService.getUser(userId);
    user.isSSOAdmin = true;

    await this.userService.repository.save(user);

    console.log(`User ${user.email} marked as SSO admin.`)
  }

  @Command({
    command: 'unmark-as-sso-admin <userId>',
    description: 'Unmark user as SSOAdmin',
  })
  async unmarkUserAsSSOAdmin(userId: string): Promise<void> {
    const user = await this.userService.getUser(userId);
    user.isSSOAdmin = false;

    await this.userService.repository.save(user);

    console.log(`User ${user.email} unmarked from SSO admin.`)
  }

  @Command({
    command: 'update <userId> <data>',
    description: 'Update user data',
  })
  async banUser(userId: string, data: string): Promise<void> {
    const user = await this.userService.getUser(userId);
    const jsonData = JSON.parse(data);

    const updated = { ...user, ...jsonData} as UserEntity;
    await this.userService.repository.save(updated);

    console.log(`User ${user.email} successfully updated`);
  }
}
