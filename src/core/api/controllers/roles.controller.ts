import { RoleBasedService } from '@iac-auth/core/rb/services';
import {
  Body,
  Controller,
  forwardRef,
  Get,
  Inject,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { Request, response, Response } from 'express';
import { RoleDto } from '@iac-auth/core/api/dto/role.dto';
import { PermissionDto } from '@iac-auth/core/api/dto';

@Controller('api/roles')
export class RolesController {
  constructor(
    @Inject(forwardRef(() => RoleBasedService))
    private readonly rolesBasedService: RoleBasedService,
  ) {}

  @Get()
  public async index(
    @Req() request: any,
    @Res() response: Response,
  ): Promise<Response> {
    const data = await this.rolesBasedService.listRoles({
      perPage: request.query.hasOwnProperty('perPage')
        ? parseInt(request.query.perPage)
        : 10,
      page: request.query.hasOwnProperty('page') ? request.query.page : 1,
    });

    return response.status(200).json(data);
  }

  @Get('items-list')
  public async getListItems(@Res() response: Response): Promise<Response> {
    const data = await this.rolesBasedService.roleRepository.find({
      select: ['id', 'name'],
    });

    return response.status(200).json(data);
  }

  @Get(':roleId')
  public async showRole(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<Response> {
    const role = await this.rolesBasedService.getRole(request.params.roleId);
    return response.status(200).json(role);
  }

  @Post()
  public async createRole(
    @Body() data: RoleDto,
    @Res() response: Response,
  ): Promise<Response> {
    const role = await this.rolesBasedService.createRole(data);
    return response.status(201).json(role);
  }

  @Post(':roleId/permissions')
  public async createPermission(
    @Body() data: PermissionDto,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<Response> {
    const permission = await this.rolesBasedService.createPermission(
      request.params.roleId,
      data,
    );
    return response.status(201).json(permission);
  }

  @Put(':roleId/permissions/:permissionId')
  public async updatePermission(
    @Body() data: PermissionDto,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<Response> {
    const permission = await this.rolesBasedService.updatePermission(
      request.params.permissionId,
      data,
    );
    return response.status(200).json(permission);
  }

  @Put(':roleId')
  public async updateRole(
    @Req() request: Request,
    @Res() response: Response,
    @Body() data: RoleDto,
  ): Promise<Response> {
    const role = await this.rolesBasedService.updateRole(
      request.params.roleId,
      data,
    );
    return response.status(200).json(role);
  }
}
