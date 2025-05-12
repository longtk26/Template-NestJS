import RedLock from 'redlock';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ProjectRepository } from '../repository/project.repository';
import { PinoLogger } from 'nestjs-pino';
import { RedisClient } from 'src/core/cache/redis';

@Injectable()
export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly logger: PinoLogger,
    private readonly redis: RedisClient,
    @Inject('REDLOCK') private readonly redLock: RedLock,
  ) {}

  async registerProject(projectId: string, userId: string) {
    this.logger.info(`timestamp: ${new Date().getTime()}`);
    const foundProject = await this.projectRepository.findOne({
      options: { id: projectId },
    });

    if (!foundProject) {
      this.logger.error('===Project is not found!===');
      throw new BadRequestException('Project is not found!');
    }

    const availableSlots = foundProject.availableSlots;
    const redisKey = `project:${projectId}`;
    const personalRedisKey = `project:${projectId}:${userId}`;

    try {
      const lock = await this.redLock.acquire([redisKey], 100);

      try {
        this.logger.info(
          `=====Acquired lock for ${redisKey} at ${new Date().getTime()}====`,
        );
        const currentDriverNumber = Number(await this.redis.get(redisKey)) || 0;
        if (currentDriverNumber + 1 > availableSlots) {
          this.logger.error('===Project is full!===');
          return;
        }

        await this.redis.set(redisKey, currentDriverNumber + 1);
        await this.redis.set(personalRedisKey, userId);
        this.logger.info(
          `===Project is registered!=== by ${userId} at ${new Date().toISOString()}`,
        );
      } finally {
        await lock.release();
      }
    } catch (error) {
      this.logger.error(
        `Failed to acquire lock for ${redisKey} at ${new Date().getTime()}`,
      );
      throw new BadRequestException('Failed to acquire lock!');
    }

    return {
      message: 'Project registered successfully!',
      id: projectId,
    };
  }
}
