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

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly config: ConfigService,
    private readonly logger: PinoLogger,
    private readonly workerProducer: WorkerProducer,
    private readonly securityService: SecurityService,
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

  async createManyUser(createManyUserDto: CreateUserDTO[]) {
    // Create a common password for all users
    const randomPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword =
      await this.securityService.hashPassword(randomPassword);
    const inputUsers = createManyUserDto.map((user) => ({
      ...user,
      password: hashedPassword,
    }));

    // Results tracking
    let successRecords = 0;
    const failedRecords = [];
    const listEmail = inputUsers.map((user) => user.email);
    const existingUsers =
      await this.userRepository.getUsersInListEmail(listEmail);
    if (existingUsers.length > 0) {
      existingUsers.forEach((user) => {
        failedRecords.push({
          ...user,
          error: 'Email already exists',
        });
      });
    }
    const userValids = inputUsers.filter((user) => {
      return !existingUsers.some(
        (existingUser) => existingUser.email === user.email,
      );
    });

    await this.userRepository.createManyUser(userValids);

    successRecords = userValids.length;

    // Generate error report file if there are failed records
    console.log('failedRecords', failedRecords);
    if (failedRecords.length > 0) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Failed Records');

      // Add headers
      worksheet.addRow(['First Name', 'Last Name', 'Email', 'Error']);

      // Add data rows
      failedRecords.forEach((record) => {
        worksheet.addRow([
          record.firstName,
          record.lastName,
          record.email,
          record.error,
        ]);
      });

      // Generate buffer for file download
      const buffer = await workbook.xlsx.writeBuffer();

      return {
        successCount: successRecords,
        failureCount: failedRecords.length,
        failedRecords,
        errorReportBuffer: buffer,
      };
    }

    return {
      successCount: successRecords,
      failureCount: 0,
    };
  }
}
