import {
  Controller,
  forwardRef,
  Get,
  Inject,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { RedisStore } from 'connect-redis';
import { UserService } from '@iac-auth/core/users';
import { AuthenticatedGuard } from '@iac-auth/core/auth';
import { ClientService } from '@iac-auth/core/oauth2/modules';
import { TokenService } from '@iac-auth/core/oauth2/services';

@UseGuards(AuthenticatedGuard)
@Controller('api/system-statistic')
export class StatisticController {
  constructor(
    @Inject(forwardRef(() => UserService))
    protected readonly userService: UserService,
    @Inject(forwardRef(() => ClientService))
    protected readonly clientService: ClientService,
    @Inject(forwardRef(() => TokenService))
    protected readonly tokenService: TokenService,
  ) {}

  @Get()
  async getStats(
    @Req() req: any,
    @Res() response: Response,
  ): Promise<Response> {
    const usersCount = await this.userService.count();
    const clientsCount = await this.clientService.count();
    const activeTokensCount = await this.tokenService.activeCount();

    const store = req.sessionStore as RedisStore;
    const sessionsList: [] = await new Promise((resolve, reject) => {
      store.all((err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });

    return response
      .json({
        usersCount,
        clientsCount,
        activeTokensCount,
        sessionsCount: sessionsList.length,
      })
      .status(200);
  }
}
