import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class PermissionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  alias: string;

  @IsNotEmpty()
  @IsBoolean()
  read: boolean;

  @IsNotEmpty()
  @IsBoolean()
  create: boolean;

  @IsNotEmpty()
  @IsBoolean()
  edit: boolean;

  @IsNotEmpty()
  @IsBoolean()
  delete: boolean;
}
