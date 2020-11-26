import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Confirm } from '@iac-auth/validators';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Confirm()
  password: string;

  @IsNotEmpty()
  @IsString()
  passwordConfirm: string;
}
