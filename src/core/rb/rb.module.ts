import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from '@iac-auth/core/rb/permission.entity';
import { RoleEntity } from '@iac-auth/core/rb/role.entity';
import { CommonModule } from '@iac-auth/core/oauth2/modules';
import { RoleBasedService } from '@iac-auth/core/rb/services';

@Module({
  imports: [
    forwardRef(() => CommonModule),
    TypeOrmModule.forFeature([RoleEntity, PermissionEntity]),
  ],
  providers: [RoleBasedService],
  exports: [RoleBasedService],
})
export class RbModule {}
