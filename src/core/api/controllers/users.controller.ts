import {
  Body,
  Controller,
  forwardRef,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RegisterService, UserService } from '@iac-auth/core/users';
import { CurrentUser, RegisterDto } from '@iac-auth/core/auth';
import { Request, Response } from 'express';
import { AuthorizationGuard } from '@iac-auth/core/oauth2';
import { classToPlain } from 'class-transformer';
import { UserEntity } from '@iac-auth/core/users/user.entity';

@UseGuards(AuthorizationGuard)
@Controller('api/users')
export class UsersController {
  constructor(
    @Inject(forwardRef(() => RegisterService))
    private readonly registerService: RegisterService,
    @Inject(forwardRef(() => UserService))
    protected readonly userService: UserService,
  ) {}

  @Get()
  public async index(
    @Req() request: any,
    @Res() response: Response,
  ): Promise<Response> {
    const data = await this.userService.list(
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

  @Get(':userId')
  public async getUser(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<Response> {
    const user = await this.userService.getUser(request.params.userId);
    response.status(200).json(classToPlain(user));

    return;
  }

  @Post()
  public async addUser(
    @Body() data: RegisterDto,
    @Res() response: Response,
  ): Promise<Response> {
    const user = await this.registerService.register(data);

    return response.status(201).json(user);
  }

  @Put(':userId')
  public async updateUser(
    @Body() data: any,
    @Req() request: Request,
    @Res() response: Response,
    @CurrentUser() currentUsr: UserEntity,
  ): Promise<any> {
    const user = await this.userService.adminUpdate(
      request.params.userId,
      data,
      currentUsr,
    );

    return response.status(200).json(user);
  }
}
