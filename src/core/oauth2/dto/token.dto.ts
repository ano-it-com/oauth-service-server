import { GrantTypes } from '@iac-auth/core/oauth2/const';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class TokenDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(GrantTypes)
  grant_type: GrantTypes;

  @ValidateIf((o: TokenDto) => o.grant_type === GrantTypes.password)
  @IsNotEmpty()
  @IsEmail()
  username: string;

  @ValidateIf((o: TokenDto) => o.grant_type === GrantTypes.password)
  @IsNotEmpty()
  @IsString()
  password: string;

  @ValidateIf((o: TokenDto) => o.grant_type === GrantTypes.authorization_code)
  @IsNotEmpty()
  @IsString()
  code: string;

  @ValidateIf((o: TokenDto) => o.grant_type === GrantTypes.authorization_code)
  @IsNotEmpty()
  @IsString()
  redirect_uri: string;

  @IsOptional()
  @IsString()
  code_verifier: string;

  @ValidateIf((o: TokenDto) => o.grant_type === GrantTypes.refresh_token)
  @IsNotEmpty()
  @IsString()
  refresh_token: string;

  @IsOptional()
  @IsString()
  client_id: string;

  @IsOptional()
  @IsString()
  client_secret: string;

  @IsOptional()
  @IsString()
  scope: string;

  get scopes(): string[] {
    return (this.scope || '').split(' ').filter(Boolean);
  }
}
