import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  Post,
  Put,
  Req,
  Res, UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthorizationGuard } from '@iac-auth/core/oauth2';
import { ClientService } from '@iac-auth/core/oauth2/modules';
import { Request, Response } from 'express';
import { ClientDto } from '@iac-auth/core/api/dto';
import { isAdminGuard } from '@iac-auth/core/api/guards';

@UseGuards(AuthorizationGuard, isAdminGuard)
@Controller('api/clients')
export class ClientsController {
  constructor(
    @Inject(forwardRef(() => ClientService))
    protected readonly clientService: ClientService,
  ) {}

  @Get()
  public async index(
    @Req() request: any,
    @Res() response: Response,
  ): Promise<Response> {
    const data = await this.clientService.list(
      {
        perPage: request.query.hasOwnProperty('perPage')
          ? parseInt(request.query.perPage)
          : 10,
        page: request.query.hasOwnProperty('page') ? request.query.page : 1,
      },
      request.query.query,
    );

    return response.status(200).json(data);
  }

  @Get('items-list')
  public async getListItems(@Res() response: Response): Promise<Response> {
    const data = await this.clientService.clientRepository.find({
      select: ['id', 'name'],
    });
    return response.status(200).json(data);
  }

  @Get(':clientId')
  public async getItem(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<Response> {
    const user = await this.clientService.getItem(request.params.clientId);

    return response.json(user).status(200);
  }

  @Post()
  public async createClient(
    @Body() data: ClientDto,
    @Res() response: Response,
  ): Promise<Response> {
    const client = await this.clientService.create(data);

    return response.json(client).status(201);
  }

  @Put(':clientId')
  public async updateClient(
    @Body() data: ClientDto,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<Response> {
    const client = await this.clientService.update(
      request.params.clientId,
      data,
    );

    return response.json(client).status(200);
  }

  @Delete(':clientId')
  public async deleteClient(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<Response> {
    await this.clientService.delete(request.params.clientId);
    return response.status(204);
  }
}
