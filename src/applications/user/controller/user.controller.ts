import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
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
  VerifyEmailUserResponseDataDTO,
  VerifyEmailUserResponseDTO,
  VerifyUserResponseDataDTO,
  VerifyUserResponseDTO,
} from '../dto/user.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UserRequest } from '../interface/user.interface';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UserController.name);
  }

  @Post('sign-up')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
    type: AuthUserResponseDTO,
  })
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
}
