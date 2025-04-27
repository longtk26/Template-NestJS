import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { UserRepository } from 'src/applications/user/repository/user.repository';
import { S3ClientService } from 'src/provider/minio/s3.service';
import { z } from 'zod';

@Injectable()
export abstract class BaseFileService {
  constructor(
    private readonly s3Service: S3ClientService,
    protected readonly userRepository: UserRepository,
    protected readonly logger: PinoLogger,
  ) {
    this.logger.setContext(BaseFileService.name);
  }
  async uploadFile(file: Express.Multer.File): Promise<string> {
    const filePath = await this.s3Service.uploadFile(file, file.path);
    return await this.s3Service.getFileUrl(filePath);
  }
  async deleteFile(filePath: string): Promise<void> {
    await this.s3Service.deleteFile(filePath);
  }

  abstract createFile<T>(
    data: T[],
    fileName: string,
  ): Promise<Express.Multer.File>;

  abstract validateFile<T, R>(
    file: Express.Multer.File,
    zodSchema: z.ZodType<T>,
  ): Promise<unknown>;
}
