import {
  PromptTypes,
  ResponseModes,
  ResponseTypes,
} from '@iac-auth/core/oauth2/const';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class AuthorizationDto {
  @IsNotEmpty()
  @IsString()
  client_id: string;

  @IsOptional()
  @IsString()
  scope: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  state: string;

  @IsOptional()
  @IsString()
  code_challenge: string;

  @ValidateIf((o: AuthorizationDto) => !!o.code_challenge)
  @IsNotEmpty()
  @IsString()
  code_challenge_method: string;

  @IsOptional()
  @IsEnum(ResponseModes, {
    message: `response_mode param must be on of this values: ${Object.values(
      ResponseModes,
    )}`,
  })
  response_mode: ResponseModes = ResponseModes.query;

  @IsNotEmpty()
  @IsEnum(ResponseTypes, {
    message: `response_type param must be on of this values: ${Object.values(
      ResponseTypes,
    )}`,
  })
  response_type: ResponseTypes;

  @IsOptional()
  @IsString()
  nonce: string;

  @IsNotEmpty()
  @IsString()
  redirect_uri: string;

  @IsOptional()
  @IsEnum(PromptTypes, {
    message: `prompt param must be one of this values: ${Object.values(
      PromptTypes,
    )}`,
  })
  prompt: PromptTypes = PromptTypes.consent;

  get scopes(): string[] {
    return (this.scope || '').split(' ').filter(Boolean);
  }
}
