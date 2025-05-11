import { Module } from '@nestjs/common';
import { ProjectController } from './controller/project.controller';
import { ProjectRepository } from './repository/project.repository';
import { ProjectService } from './service/project.service';
import { RedisModule } from 'src/core/cache/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository],
  exports: [ProjectService, ProjectRepository],
})
export class ProjectModule {}
