import { BadRequestException, Injectable } from '@nestjs/common';
import { ProjectRepository } from '../repository/project.repository';
import { PinoLogger } from 'nestjs-pino';
import { RedisClient } from 'src/core/cache/redis';

@Injectable()
export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly logger: PinoLogger,
    private readonly redis: RedisClient,
  ) {}

  async registerProject(projectId: string) {
    const foundProject = await this.projectRepository.findOne({
      options: {
        id: projectId,
      },
    });

    if (!foundProject) {
      this.logger.error('===Project is not found!===');
      throw new BadRequestException('Project is not found!');
    }
    const availableSlots = foundProject.availableSlots;

    const redisKey = `project:${projectId}`;
    const redisValue = Number(await this.redis.get(redisKey));

    if (!redisValue) {
      const currentDriverNumber = 0;

      if (currentDriverNumber + 1 > availableSlots) {
        this.logger.error('===Project is full!===');
        throw new BadRequestException('Project is full!');
      }

      await this.redis.set(redisKey, currentDriverNumber + 1);

      return {
        message: 'Project registered successfully!',
        id: projectId,
      };
    }

    if (redisValue + 1 > availableSlots) {
      this.logger.error('===Project is full!===');
      throw new BadRequestException('Project is full!');
    }

    await this.redis.set(redisKey, redisValue + 1);

    const afterRegistered = Number(await this.redis.get(redisKey));
    if (afterRegistered > availableSlots) {
      this.logger.error('===Over register!!!!!!!!!===');
    }

    return {
      message: 'Project registered successfully!',
      id: projectId,
    };
  }
}
