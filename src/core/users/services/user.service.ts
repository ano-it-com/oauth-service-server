import { Repository } from 'typeorm';
import ActiveDirectory from 'activedirectory';
import ldapjs from 'ldapjs';
import moment from 'moment'
import { UserEntity } from '@iac-auth/core/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordService } from '@iac-auth/core/users/services/password.service';
import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
import {
  Pagination,
  PaginationOptionsInterface,
} from '@iac-auth/contracts/pagination';
import { Request } from 'express';
import { RoleBasedService } from '@iac-auth/core/rb/services';
import OpenIdException from '@iac-auth/core/open-id/exceptions';

export type UserEntityPreview = Pick<
  UserEntity,
  'id' | 'username' | 'firstName' | 'lastName' | 'email' | 'picture'
>;

const EMAIL_RE = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

@Injectable()
export class UserService {
  private readonly retrieveAndCreateUserFromLDAP: (username, password) => Promise<UserEntity>;
  private readonly changePasswordInLDAPForUser: (username, password) => Promise<boolean>;

  constructor(
    @InjectRepository(UserEntity)
    public readonly repository: Repository<UserEntity>,
    private readonly passwordService: PasswordService,
    @Inject(forwardRef(() => RoleBasedService))
    private readonly roleBasedService: RoleBasedService,
  ) {
    this.retrieveAndCreateUserFromLDAP = (username, password): Promise<UserEntity> => new Promise((resolve, reject) => {
      const ad = new ActiveDirectory({
        url: process.env.LDAP_URL,
        baseDN: process.env.LDAP_DN,
        bindDN: `uid=ldapread,${process.env.LDAP_DN}`,
        username: 'ldapread',
        password: process.env.LDAP_CREDENTIALS_PASSWORD,
        filter: 'objectClass=person',
        scope: 'sub',
        attributes: { user: ['uid', 'sn', 'givenName', 'mail', 'displayName'] },
        // logging: { name: 'ad', level: 10 }
      });

      ad.authenticate(`uid=${username},${process.env.LDAP_DN}`, password, (err, auth) => {
        if (err && auth !== true) {
          reject('Wrong Credentials');
        }

        if (auth) {
          ad.findUser({
            filter: `(&(objectClass=person)(uid=${username}))`,
          }, username, async (err, user) => {
            if (err && user !== true) {
              reject('Wrong credentials');
            }

            // create new user
            let newUser = new UserEntity();
            newUser.email = user.mail;
            newUser.username = user.uid;
            newUser.firstName = user.sn;
            newUser.lastName = user.givenName;
            newUser.password = password;
            newUser.fromLDAP = true;

            await this.repository.save(
              this.repository.create(newUser),
            );

            newUser = await this.repository.findOne(
              { username },
              { select: ['id', 'password'] },
            );

            resolve(newUser);
          });
        }
      });
    });

    this.changePasswordInLDAPForUser = ((username, password): Promise<boolean> => new Promise(((resolve, reject) => {
      const client = ldapjs.createClient({
        url: process.env.LDAP_URL,
      });

      client.bind(
        `uid=ldapssosp,${process.env.LDAP_DN}`,
        process.env.LDAP_WRITE_CREDENTIALS_PASSWORD,
        (err, result) => {
          if (err) {
            throw new RuntimeException('LDAP Error');
          }

          client.search(process.env.LDAP_DN, {
            filter: `(&(objectClass=person)(uid=${username}))`,
            attributes: ['sn'],
            scope: 'sub',
          }, (err, result) => {
            if (err) { reject('Error on search method while connecting to client'); }

            result.on('searchEntry', entry => {
              const userDN = entry.object.dn;

              const errCallback = err => {
                if (err) { client.unbind(); reject(err); }
                resolve(true);
              };

              client.modify(userDN, [
                new ldapjs.Change({
                  operation: 'replace',
                  modification: {
                    userPassword: password,
                  },
                }),
              ], errCallback);

              client.modify(userDN, [
                new ldapjs.Change({
                  operation: 'replace',
                  modification: {
                    krbPasswordExpiration: moment().add(2, 'months').format('YYYYMMDDHHmmss') + 'Z',
                  },
                }),
              ], errCallback);
            });

            result.on('error', err => {
              reject('password change error: ' + err.message);
            });

            result.on('end', status => {
              resolve(true);
            });
          })
        });
    })))
  }

  async list(
    options: PaginationOptionsInterface,
    query?: string,
  ): Promise<Pagination<UserEntityPreview>> {
    const builder = this.repository.createQueryBuilder('users');
    builder
      .take(options.perPage)
      .skip(options.page ? (options.page - 1) * options.perPage : 0)
      .select([
        'users.id',
        'users.username',
        'users.firstName',
        'users.lastName',
        'users.email',
        'users.bannedAt',
        'users.fromLDAP',
        'users.isSSOAdmin'
      ]);

    if (query) {
      builder
        .andWhere('users.lastName ilike :query OR users.firstName ilike :query')
        .orWhere('users.email ilike :query')
        .setParameter('query', `%${query}%`);
    }

    builder.orderBy('users.createdAt', 'ASC');


    const [results, total] = await builder.getManyAndCount();

    return new Pagination<UserEntityPreview>({
      results: results.map(user => ({
        ...user,
        picture: user.picture,
      })) as UserEntityPreview[],
      total,
      currentPage: options.page,
      perPage: options.perPage,
    });
  }

  async getUser(userId: string): Promise<UserEntity> {
    return this.repository.findOneOrFail(userId, { relations: ['roles', 'bannedBy'] });
  }

  async findAndAuthenticate({
    email,
    password,
  }: Partial<UserEntity>, req: Request): Promise<UserEntity> {
    const builder = this.repository.createQueryBuilder('users');
    builder.select(['users.id', 'users.username', 'users.password', 'users.bannedAt']);

    const isEmail = EMAIL_RE.test(email.toLowerCase());
    if (isEmail) {
      builder.andWhere('users.email = :field');
    } else {
      builder.andWhere('users.username = :field')
    }

    builder.setParameter('field', email);

    let user = await builder.getOne();

    if ((!user || !await user.validatePassword(password)) && isEmail) {
      throw new UnauthorizedException('Wrong credentials');
    } else if (!isEmail && (!user || !await user.validatePassword(password))) {
      try {
        user = await this.retrieveAndCreateUserFromLDAP(email, password);
      } catch (e) {
        throw new UnauthorizedException('Wrong credentials');
      }
    }

    if (user.bannedAt) {
      throw OpenIdException.accountSuspended();
    }

    return user;
  }

  async adminUpdate(
    userId: string,
    data: Partial<UserEntity & { passwordConfirm?: string, isSSOAdmin?: boolean, isBanned?: boolean }>,
    currentUser?: UserEntity,
  ): Promise<UserEntity> {
    const entity = await this.repository.findOneOrFail(userId);
    entity.username = data.username;
    entity.isSSOAdmin = data.isSSOAdmin;
    entity.firstName = data.firstName;
    entity.lastName = data.lastName;
    entity.email = data.email;

    if (data.isBanned) {
      entity.bannedAt = new Date();
      entity.bannedBy = currentUser;
    } else {
      entity.bannedAt = null;
      entity.bannedBy = null;
    }

    if (data.password) {
      const passwordStrengthVerify = this.passwordService.verifyStrength(
        data.password,
      );

      if (passwordStrengthVerify) {
        throw new RuntimeException(passwordStrengthVerify);
      }

      entity.password = data.password;

      if (entity.fromLDAP) {
        await this.changePasswordInLDAPForUser(entity.username, data.password);
      }
    }

    entity.roles = data.roles && data.roles.length ? await this.roleBasedService.roleRepository.findByIds(data.roles) : [];

    await this.repository.save(entity);

    return entity;
  }

  async update(
    user: UserEntity,
    data: Partial<
      UserEntity & { passwordConfirm?: string; currentPassword: string }
    >,
  ): Promise<UserEntity> {
    const entity = await this.repository.findOne(user.id);

    if (data.password) {
      const passwordStrengthVerify = this.passwordService.verifyStrength(
        data.password,
      );

      if (passwordStrengthVerify) {
        throw new RuntimeException(passwordStrengthVerify);
      }

      if (!data.currentPassword) {
        throw new RuntimeException('Missing current user password');
      }

      const validatePassword = await entity.validatePassword(
        data.currentPassword,
      );
      if (!validatePassword) {
        throw new RuntimeException('Wrong current password');
      }

      delete data.currentPassword;
      delete data.passwordConfirm;

      const updated = { ...entity, ...data };

      return this.repository.save(updated);
    }
  }

  async count(): Promise<number> {
    return this.repository.count();
  }
}
