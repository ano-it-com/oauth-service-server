import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ClientEntity } from '@iac-auth/core/oauth2/client.entity';
import {
  ClientCredentials,
  CredentialTuple,
} from '@iac-auth/core/oauth2/interfaces';
import { OAuthException } from '@iac-auth/core/oauth2/exceptions';
import { TokenAuthMethod } from '@iac-auth/core/oauth2/const';
import { IncomingHttpHeaders } from 'http';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Pagination,
  PaginationOptionsInterface,
} from '@iac-auth/contracts/pagination';
import { ClientDto } from '@iac-auth/core/api/dto';
import { UserEntity } from '@iac-auth/core/users/user.entity';

export type ClientEntityPreview = Pick<
  ClientEntity,
  'id' | 'name' | 'scopes' | 'grants'
>;

@Injectable()
export class ClientService {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectRepository(ClientEntity)
    public readonly clientRepository: Repository<ClientEntity>,
  ) {}

  public async list(
    options: PaginationOptionsInterface,
    query?: string,
  ): Promise<Pagination<ClientEntityPreview>> {
    const builder = this.clientRepository.createQueryBuilder('clients');
    builder
      .take(options.perPage)
      .skip(options.page ? (options.page - 1) * options.perPage : 0)
      .select([
        'clients.id',
        'clients.name',
        'clients.scopes',
        'clients.grants',
      ]);

    if (query) {
      builder
        .andWhere('clients.name ilike :query')
        .orderBy('clients.createdAt', 'ASC')
        .setParameter('query', `%${query}%`);
    }

    const [results, total] = await builder.getManyAndCount();

    return new Pagination<ClientEntityPreview>({
      results,
      total,
      currentPage: options.page,
      perPage: options.perPage,
    });
  }

  public async getItem(clientId: string): Promise<ClientEntity> {
    return this.clientRepository.findOneOrFail(clientId);
  }

  public async create(data: ClientDto): Promise<ClientEntity> {
    return this.clientRepository.save(this.clientRepository.create(data));
  }

  public async update(
    clientId: string,
    data: Partial<ClientDto & { acceptedUsers?: UserEntity[] }>,
  ): Promise<ClientEntity> {
    const client = await this.getItem(clientId);
    const updated = { ...client, ...data } as ClientEntity;

    return this.clientRepository.save(updated);
  }

  public async getClient(
    { clientId, clientSecret, type }: ClientCredentials,
    validateSecret = true,
  ): Promise<ClientEntity> {
    const client = await this.clientRepository.findOne(clientId, {
      relations: ['acceptedUsers'],
    });
    if (!client) {
      this.logger.warn(`Client not found (id: ${clientId})`);
      throw OAuthException.invalidClient();
    }

    if (validateSecret || type === TokenAuthMethod.client_secret_basic) {
      if (!client.canHandleAuthMethod(type)) {
        throw OAuthException.invalidClient(`Unsupported auth method: ${type}`);
      }

      if (
        type !== TokenAuthMethod.none &&
        (clientSecret !== client.secret || !clientSecret)
      ) {
        throw OAuthException.invalidClient();
      }
    }

    return client;
  }

  public getClientCredentials(
    { client_id, client_secret }: { client_id: string; client_secret?: string },
    headers?: IncomingHttpHeaders,
  ): ClientCredentials {
    if (headers) {
      const [basicAuthUser, basicAuthPassword] = this.getBasicAuthCredentials(
        headers,
      );
      if (basicAuthUser) {
        return {
          clientId: basicAuthUser,
          clientSecret: basicAuthPassword,
          type: TokenAuthMethod.client_secret_basic,
        };
      }
    }

    if (!client_id) {
      throw OAuthException.invalidRequest('client_id');
    }

    return {
      clientId: client_id,
      clientSecret: client_secret,
      type: client_secret
        ? TokenAuthMethod.client_secret_post
        : TokenAuthMethod.none,
    };
  }

  protected getBasicAuthCredentials(
    headers: IncomingHttpHeaders,
  ): CredentialTuple {
    if (!headers.authorization) return [null, null];

    const header = headers.authorization;
    if (!header.startsWith('Basic')) return [null, null];

    const token = header.substring(6);
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    if (!decoded || decoded.indexOf(':') < 0) {
      return [null, null];
    }

    return decoded.split(':') as CredentialTuple;
  }

  public async count(): Promise<number> {
    return this.clientRepository.count();
  }

  public async delete(clientId: string): Promise<any> {
    return this.clientRepository.delete(clientId);
  }
}
