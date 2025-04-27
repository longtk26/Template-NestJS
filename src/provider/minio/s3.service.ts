import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigObjKey, ConfigType } from 'src/config/interface';
import { PinoLogger } from 'nestjs-pino';
import {
  S3Client,
  HeadBucketCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3ClientService {
  private s3Config: ConfigType['s3'];
  private bucketName: string;
  private s3Client: S3Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.s3Config = this.configService.get<
      ConfigType,
      ConfigObjKey,
      ConfigType['s3']
    >('s3', { infer: true });
    this.bucketName = this.s3Config.bucketName;
    this.logger.setContext(S3ClientService.name);
    this.initS3Client();
  }

  initS3Client() {
    try {
      this.s3Client = new S3Client({
        region: this.s3Config.region,
        credentials: {
          accessKeyId: this.s3Config.accessKey,
          secretAccessKey: this.s3Config.secretKey,
        },
      });
      this.logger.info('AWS S3 client initialized successfully');
      this.checkBucket();
    } catch (error) {
      this.logger.error(`Error initializing S3 client: ${error.message}`);
    }
  }

  async checkBucket() {
    try {
      const command = new HeadBucketCommand({ Bucket: this.bucketName });
      await this.s3Client.send(command);
      this.logger.info(`Bucket ${this.bucketName} exists`);
    } catch (error) {
      if (error.name === 'NotFound' || error.name === 'NoSuchBucket') {
        this.logger.info(
          `Bucket ${this.bucketName} does not exist, creating...`,
        );
        // const createCommand = new CreateBucketCommand({
        //   Bucket: this.bucketName,
        //   CreateBucketConfiguration: {
        //     LocationConstraint: this.s3Config.region,
        //   },
        // });
        // await this.s3Client.send(createCommand);
        this.logger.info(`Bucket ${this.bucketName} created successfully`);
      } else {
        this.logger.error(`Error checking bucket: ${error.message}`);
      }
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    filePath: string,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: filePath,
        Body: file.buffer,
        ContentType: file.mimetype,
      });
      await this.s3Client.send(command);
      this.logger.info(`File ${filePath} uploaded successfully to S3`);
      return filePath;
    } catch (error) {
      this.logger.error(`Error uploading file to S3: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: filePath,
      });
      await this.s3Client.send(command);
      this.logger.info(`File ${filePath} deleted successfully from S3`);
    } catch (error) {
      this.logger.error(`Error deleting file from S3: ${error.message}`);
      throw error;
    }
  }

  async getFileUrl(filePath: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: filePath,
      });
      // URL expires in 1 hour
      return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    } catch (error) {
      this.logger.error(`Error generating signed URL: ${error.message}`);
      throw error;
    }
  }
}
