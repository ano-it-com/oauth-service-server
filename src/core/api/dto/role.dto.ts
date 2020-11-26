import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  clientId: string;

  @IsArray()
  @IsString({ each: true })
  permissionIds: [];
}
