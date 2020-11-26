import { Not, Repository } from 'typeorm/index';
import { PermissionEntity, RoleEntity } from '@iac-auth/core/rb';
import { ClientService } from '@iac-auth/core/oauth2/modules';
import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  Pagination,
  PaginationOptionsInterface,
} from '@iac-auth/contracts/pagination';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionDto } from '@iac-auth/core/api/dto';

@Injectable()
export class RoleBasedService {
  constructor(
    @InjectRepository(RoleEntity)
    public readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
    @Inject(forwardRef(() => ClientService))
    private readonly clientService: ClientService,
  ) {}

  public async listRoles(
    options: PaginationOptionsInterface,
  ): Promise<Pagination<any>> {
    const [results, total] = await this.roleRepository.findAndCount({
      take: options.perPage,
      skip: options.page ? (options.page - 1) * options.perPage : 0,
      order: { name: 'ASC' },
      select: ['name', 'id'],
      relations: ['users', 'permissions', 'client'],
    });

    return new Pagination({
      results,
      total,
      currentPage: options.page,
      perPage: options.perPage,
    });
  }

  public async createRole(
    data: Partial<RoleEntity & { clientId?: string }>,
  ): Promise<RoleEntity> {
    const rolesWithCount = await this.roleRepository.findAndCount({
      alias: data.alias,
    });
    if (rolesWithCount[1]) {
      throw new ConflictException(null, 'Alias already exist in database');
    }

    let roleClient = null;
    if (data.clientId) {
      roleClient = await this.clientService.getItem(data.clientId);
    }

    const entityData = { ...data, client: roleClient } as RoleEntity;

    const role = await this.roleRepository.save(
      this.roleRepository.create(entityData),
    );
    return this.roleRepository.findOne(role.id);
  }

  public async updateRole(
    roleId: string,
    data: Partial<RoleEntity> & { permissionIds?: []; clientId?: string },
  ): Promise<RoleEntity> {
    const rolesWithCount = await this.roleRepository.findAndCount({
      id: Not(roleId),
      alias: data.alias,
    });
    if (rolesWithCount[1]) {
      throw new ConflictException(null, 'Alias already exist in database');
    }

    await this.roleRepository.update(roleId, { name: data.name });
    const role = await this.roleRepository.findOne(roleId, {
      relations: ['permissions'],
    });
    // const permissions = await this.permissionRepository.findByIds(data.permissionIds);
    const client = await this.clientService.getItem(data.clientId);

    // role.permissions = permissions;
    role.client = client;

    return this.roleRepository.save(role);
  }

  public async createPermission(
    roleId: string,
    data: Partial<PermissionEntity>,
  ): Promise<PermissionEntity> {
    const permissionsWithCount = await this.permissionRepository.findAndCount({
      alias: data.alias,
    });
    if (permissionsWithCount[1]) {
      throw new ConflictException(null, 'Alias already exist in database');
    }

    const role = await this.roleRepository.findOne(roleId, {
      relations: ['permissions'],
    });

    const permission = await this.permissionRepository.save(
      this.permissionRepository.create(data),
    );

    role.permissions.push(permission);

    await this.roleRepository.save(role);

    return permission;
  }

  public async updatePermission(
    permissionId: string,
    data: Partial<PermissionDto>,
  ): Promise<PermissionEntity> {
    const permissionsWithCount = await this.permissionRepository.findAndCount({
      id: Not(permissionId),
      alias: data.alias,
    });
    if (permissionsWithCount[1]) {
      throw new ConflictException(null, 'Alias already exist in database');
    }

    await this.permissionRepository.update(permissionId, data);
    return this.permissionRepository.findOne(permissionId);
  }

  public async attachPermissions(
    roleId: string,
    permissionIds: [],
  ): Promise<RoleEntity> {
    const role = await this.roleRepository.findOne(roleId);
    const permissions = await this.permissionRepository.findByIds(
      permissionIds,
      { relations: ['permissions'] },
    );

    role.permissions = [
      ...role.permissions,
      ...permissions,
    ] as PermissionEntity[];

    return this.roleRepository.save(role);
  }

  public async getRole(roleId: string): Promise<RoleEntity | null> {
    return this.roleRepository
      .createQueryBuilder('role')
      .where('role.id = :roleId', { roleId })
      .leftJoinAndSelect('role.permissions', 'permissions')
      .leftJoinAndSelect('role.client', 'client')
      .leftJoinAndSelect('role.users', 'users')
      .addOrderBy('permissions.name', 'ASC')
      .getOne();
  }
}
