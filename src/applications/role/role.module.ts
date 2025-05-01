import { Module } from '@nestjs/common';
import { RoleRepository } from './repository/role.repository';

@Module({
  providers: [RoleRepository],
  exports: [RoleRepository],
})
export class RoleModule {}
