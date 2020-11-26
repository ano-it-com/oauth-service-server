import { UserEntity } from '@iac-auth/core/users/user.entity';

export interface SessionPayload {
  user: UserEntity;
  info: {
    ip: string;
    userAgent?: string;
  };
}

export interface SerializedSessionPayload {
  userId: string;
  info: {
    ip: string;
    userAgent?: string;
    createdAt?: number;
  };
}
