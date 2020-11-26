import { TokenType } from '@iac-auth/core/oauth2/const';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class IntrospectDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsOptional()
  @IsString()
  client_id?: string;

  @IsOptional()
  @IsString()
  client_secret?: string;

  @IsOptional()
  @IsEnum(TokenType, {
    message: `token_type_hint param must be one of this values: ${Object.values(
      TokenType,
    )}`,
  })
  token_type_hint: TokenType;
}
