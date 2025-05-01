import { Module } from '@nestjs/common';
import { S3ClientService } from './s3/s3.service';

@Module({
  imports: [],
  providers: [S3ClientService],
  exports: [S3ClientService],
})
export class ProviderModule {}
