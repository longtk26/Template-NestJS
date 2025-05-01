import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { CreateUserDTO, SignInDTO, UpdateUserDTO } from '../dto/user.dto';
import { UserRepository } from '../repository/user.repository';
import { ConfigService } from '@nestjs/config';
import { ConfigEnum } from 'src/config/config';
import {
  BadRequestException,
  UnauthorizedException,
} from 'src/core/response/error.response';
import { WorkerProducer } from 'src/worker/worker.producer';
import { WorkerQueuesEnum } from 'src/worker/worker.enum';
import { SecurityService } from 'src/core/security/security.service';
import * as crypto from 'crypto';
import * as ExcelJS from 'exceljs';
import { Prisma } from '@prisma/client';
import { CSVFileService } from 'src/applications/file/service/csv-file.service';
import { z } from 'zod';
import { add } from 'lodash';
import {
  CreateManyUserArrayType,
  createManyUserSchemaArray,
  CreateManyUserType,
} from '../types/user.types';
import { S3ClientService } from 'src/provider/s3/s3.service';
import dayjs from 'dayjs';
import { RoleRepository } from 'src/applications/role/repository/role.repository';
import { ERole } from 'src/applications/role/constants/role.constants';
import { console } from 'inspector';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly config: ConfigService,
    private readonly logger: PinoLogger,
    private readonly workerProducer: WorkerProducer,
    private readonly securityService: SecurityService,
    private readonly csvFileService: CSVFileService,
    private readonly s3Service: S3ClientService,
    private readonly roleRepository: RoleRepository,
  ) {
    this.logger.setContext(UserService.name);
  }

  async createUser(createUserDto: CreateUserDTO) {
    // Step 1: Check user exist in db
    const userDb = await this.userRepository.getUserByEmail(
      createUserDto.email,
    );

    if (userDb) {
      throw new BadRequestException('User existed!');
    }
    // Step 2: Create hashpasswd and save user to db
    const hashPasswd = await this.securityService.hashPassword(
      createUserDto.password,
    );
    const newUser = await this.userRepository.createUser({
      ...createUserDto,
      password: hashPasswd,
    });

    // Step 3: Create accToken and refreshToken
    const payloadUser = { userId: newUser.id };
    const { accessToken, refreshToken } =
      this.securityService.createAccessAndRefreshToken(payloadUser);

    // Step 4: return info
    return {
      id: newUser.id,
      email: newUser.email,
      accessToken,
      refreshToken,
    };
  }

  async signIn(signInDto: SignInDTO) {
    // Step 1: Check user exist in db
    const userDb = await this.userRepository.getUserByEmail(signInDto.email);

    if (!userDb) {
      throw new BadRequestException('Credentials are invalid');
    }
    // Step 2: Compare hashPassword
    const isPasswd = await this.securityService.comparePassword(
      signInDto.password,
      userDb.password,
    );
    if (!isPasswd) {
      throw new UnauthorizedException('Credentials are invalid');
    }

    // Step 3: Create accToken and refreshToken
    const payloadUser = { userId: userDb.id };
    const { accessToken, refreshToken } =
      this.securityService.createAccessAndRefreshToken(payloadUser);

    // Step 4: return info
    return {
      id: userDb.id,
      email: userDb.email,
      accessToken,
      refreshToken,
    };
  }

  async getUserById(userId: string) {
    const data = await this.userRepository.getUserById(userId);

    return {
      id: data.id,
      name: data.firstName,
      email: data.email,
      isVerified: data.isVerified,
    };
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDTO) {
    const userDb = await this.userRepository.getUserById(userId);
    this.logger.info(`userId: ${userId}`);
    this.logger.info(`updateUserDto: ${JSON.stringify(userDb)}`);

    if (!userDb) {
      throw new BadRequestException('User not found');
    }

    const updatedUser = await this.userRepository.updateUser(
      userId,
      updateUserDto,
    );

    return {
      id: updatedUser.id,
    };
  }

  async createManyUser(file: Express.Multer.File) {
    // Step 1: Validate file
    this.csvFileService.validateFile(file);

    // Step 2: Read file
    const dataUsers = (await this.csvFileService.readFile(
      file,
      'CSV',
    )) as CreateManyUserArrayType;

    // Step 3: Validate data
    const { successRecords, failedRecords } = await this.validateDataUsers(
      dataUsers,
      createManyUserSchemaArray,
    );

    // Step 4: Create bulk user
    this.logger.info(`successRecords - ${successRecords.length}`);
    this.logger.info(`failedRecords - ${failedRecords.length}`);
    const currentTimeStamp = dayjs().valueOf();

    return await this.userRepository.transactional(async () => {
      const role = await this.roleRepository.findByName(ERole.LEARNER);
      if (successRecords.length > 0) {
        await this.userRepository.createManyUserWithDefaultRole(
          successRecords as Prisma.UserCreateInput[],
          role.id,
        );
      }
      let signedUrl = '';
      if (failedRecords.length > 0) {
        const fileName = `${currentTimeStamp}-failed-records`;
        const failedFile = this.csvFileService.writeFile(
          failedRecords,
          fileName,
          'CSV',
        );

        const filePath = await this.s3Service.uploadFile(
          failedFile,
          `${fileName}.csv`,
        );
        signedUrl = await this.s3Service.getFileUrl(filePath);
      }

      return {
        successRecords: successRecords.length,
        failedRecords: failedRecords.length,
        signedUrl,
      };
    });
  }

  private async validateDataUsers(
    dataUsers: CreateManyUserArrayType,
    zodSchema: z.ZodSchema<CreateManyUserArrayType>,
  ) {
    const dataUsersAfterCheckDuplicateEmail = [];
    const failedRecords = [];
    let successRecords: CreateManyUserArrayType = [];

    // Check for duplicate emails in the file
    const uniqueEmails = new Set();
    for (const dataUser of dataUsers) {
      if (uniqueEmails.has(dataUser.email)) {
        failedRecords.push({
          ...dataUser,
          description: 'Email already exists in your file',
        });
        continue;
      }
      uniqueEmails.add(dataUser.email);
      dataUsersAfterCheckDuplicateEmail.push(dataUser);
    }
    const listEmail = Array.from(uniqueEmails) as string[];
    this.logger.info(`email duplicate in file - ${failedRecords.length}`);

    // Check for duplicate emails in system
    const existingEmailsInSystem = (
      await this.userRepository.getUsersInListEmail(listEmail)
    ).map((user) => user.email);
    const uniqueEmailsInSystem = new Set(existingEmailsInSystem);
    this.logger.info(
      `existingEmailsInSystem - ${existingEmailsInSystem.length}`,
    );

    // Filter out records that are not in the system
    const validDatas = dataUsersAfterCheckDuplicateEmail.filter((record) => {
      const isExistEmail = uniqueEmailsInSystem.has(record.email);

      if (isExistEmail) {
        failedRecords.push({
          ...record,
          description: 'Email already exists in system',
        });
      }

      return !isExistEmail;
    });
    this.logger.info(`validDatas - ${validDatas.length}`);
    // Validate each record against the schema
    try {
      // Only include the fields defined in the schema and nothing else
      successRecords = await zodSchema.parseAsync(validDatas);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const listRowNumber = new Set();

        for (const err of error.issues) {
          const rowNumber = Number(err.path[0]);
          const fieldErr = err.path[1];
          const row = validDatas[rowNumber];

          const description = `${fieldErr} (${err.message})`;

          if (!listRowNumber.has(rowNumber)) {
            failedRecords.push({
              ...row,
              description,
            });
          }
          listRowNumber.add(rowNumber);
        }
        successRecords = validDatas.filter(
          (_, index) => !listRowNumber.has(index),
        );
      }
    }

    const defaultPassword = await this.securityService.hashPassword('123456');

    successRecords = successRecords.map((record) => ({
      ...record,
      password: defaultPassword,
    }));

    return {
      successRecords,
      failedRecords,
    };
  }
}
