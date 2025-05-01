import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { SuccessResponse } from 'src/core/response/success.response';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import {
  AuthUserResponseDataDTO,
  AuthUserResponseDTO,
  CreateUserDTO,
  GetUserResponseDataDTO,
  GetUserResponseDTO,
  SignInDTO,
  UpdateUserDTO,
  VerifyEmailUserResponseDataDTO,
  VerifyEmailUserResponseDTO,
  VerifyUserResponseDataDTO,
  VerifyUserResponseDTO,
} from '../dto/user.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UserRequest } from '../interface/user.interface';
import { Public } from 'src/applications/guards/decorators/guard.decorator';
import { AuditLog } from 'src/applications/audit-log/decorators/audit-log.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import * as ExcelJS from 'exceljs';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UserController.name);
  }

  // @Public()
  @Post('sign-up')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
    type: AuthUserResponseDTO,
  })
  @AuditLog('<name_admin> have created <name_user> on <timestamp>')
  async signUp(@Res() res: Response, @Body() createUserDto: CreateUserDTO) {
    const data = await this.userService.createUser(createUserDto);

    return new SuccessResponse<AuthUserResponseDataDTO>({
      status: HttpStatus.CREATED,
      message: 'User created',
      data: data,
    }).send(res);
  }

  @Post('sign-in')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User login successfully',
    type: AuthUserResponseDTO,
  })
  async signIn(@Res() res: Response, @Body() signInDto: SignInDTO) {
    const data = await this.userService.signIn(signInDto);

    return new SuccessResponse<AuthUserResponseDataDTO>({
      status: HttpStatus.OK,
      message: 'User login',
      data: data,
    }).send(res);
  }

  @Get('profile')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'API to get user profile',
    type: GetUserResponseDTO,
  })
  @ApiBearerAuth()
  async profile(@Res() res: Response, @Req() req: UserRequest) {
    const data = await this.userService.getUserById(req.user.userId);

    return new SuccessResponse<GetUserResponseDataDTO>({
      status: HttpStatus.OK,
      message: 'User profile',
      data: data,
    }).send(res);
  }

  @Patch(':id')
  @Public()
  async updateUser(
    @Res() res: Response,
    @Req() req: UserRequest,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDTO,
  ) {
    const data = await this.userService.updateUser(id, updateUserDto);

    return new SuccessResponse({
      status: HttpStatus.OK,
      message: 'Update user successfully',
      data: data,
    }).send(res);
  }

  @Public()
  @UseInterceptors(FileInterceptor('file'))
  @Post('create-many')
  async createManyUser(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const data = await this.userService.createManyUser(file);

    // If no errors, return standard JSON response
    return new SuccessResponse({
      status: HttpStatus.CREATED,
      message: 'Create many users successfully',
      data: data,
    }).send(res);
  }
}
