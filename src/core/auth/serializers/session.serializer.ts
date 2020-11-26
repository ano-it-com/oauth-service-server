import { PassportSerializer } from '@nestjs/passport';
import { Repository } from 'typeorm';
import { UserEntity } from '@iac-auth/core/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  SerializedSessionPayload,
  SessionPayload,
} from '@iac-auth/core/auth/interfaces';
import { plainToClass } from 'class-transformer';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super();
  }

  serializeUser(
    data: SessionPayload,
    done: (err: Error | null, data?: SerializedSessionPayload) => void,
  ): any {
    done(null, {
      userId: data.user.id,
      info: data.info,
    });
  }

  async deserializeUser(
    payload: SerializedSessionPayload,
    done: (err: Error | null, data?: any) => void,
  ): Promise<any> {
    const user = await this.userRepository.findOne(payload.userId);
    if (!user) {
      return done(new NotFoundException('User not found'));
    }
    done(null, plainToClass(UserEntity, user));
  }
}
