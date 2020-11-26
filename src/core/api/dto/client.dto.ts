import {
  GrantTypes,
  ResponseModes,
  ResponseTypes,
  Scopes,
  TokenAuthMethod,
} from '@iac-auth/core/oauth2/const';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class ClientDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  grants: GrantTypes[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responseTypes: ResponseTypes[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responseModes: ResponseModes[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes: Scopes[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  authMethods: TokenAuthMethod[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  redirectUrls: string[];

  @IsBoolean()
  firstParty: boolean;
}
