import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { SuccessResponse } from 'src/core/response/success.response';

export class CreateUserDTO {
  @ApiProperty()
  @IsNotEmpty({ message: 'Please enter name' })
  @IsString({ message: 'Please enter a valid name' })
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty({ message: 'Please enter email' })
  email: string;

  @ApiProperty()
  @Length(6, 50, {
    message: 'Password length Must be between 6 and 50 charcters',
  })
  password: string;
}

export class SignInDTO {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty({ message: 'Please enter email' })
  email: string;

  @ApiProperty()
  @Length(6, 50, {
    message: 'Password length Must be between 6 and 50 charcters',
  })
  password: string;
}

export class AuthUserResponseDataDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
export class VerifyUserResponseDataDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;
}

export class VerifyEmailUserResponseDataDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  isVerified: boolean;
}

export class GetUserResponseDataDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  isVerified: boolean;
}

export class AuthUserResponseDTO extends SuccessResponse<AuthUserResponseDataDTO> {
  @ApiProperty({ type: () => AuthUserResponseDataDTO })
  protected data: AuthUserResponseDataDTO;
}

export class VerifyUserResponseDTO extends SuccessResponse<VerifyUserResponseDataDTO> {
  @ApiProperty({ type: () => VerifyUserResponseDataDTO })
  protected data: VerifyUserResponseDataDTO;
}

export class VerifyEmailUserResponseDTO extends SuccessResponse<VerifyEmailUserResponseDataDTO> {
  @ApiProperty({ type: () => VerifyEmailUserResponseDataDTO })
  protected data: VerifyEmailUserResponseDataDTO;
}

export class GetUserResponseDTO extends SuccessResponse<GetUserResponseDataDTO> {
  @ApiProperty({ type: () => GetUserResponseDataDTO })
  protected data: GetUserResponseDataDTO;
}
