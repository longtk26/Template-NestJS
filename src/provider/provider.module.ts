import { Module } from '@nestjs/common';
import { S3ClientService } from './minio/s3.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [S3ClientService],
  exports: [S3ClientService],
})
export class ProviderModule {}
