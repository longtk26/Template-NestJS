import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';
import { OptionResendEmail } from '../types/auth.types';

export class ForgotPasswordRequestDto {
  @ApiProperty({
    description: 'The email address of the user requesting a password reset',
  })
  @IsEmail()
  email: string;
}

export class ResetPasswordRequestDto {
  @ApiProperty({
    description: 'The new password for the user',
  })
  password: string;

  @ApiProperty({
    description: 'The confirmation of the new password',
  })
  confirmPassword: string;

  @ApiProperty({
    description: 'The token for resetting the password',
  })
  token: string;
}

export class ResendEmailDto {
  @ApiProperty({
    description: 'The email address of the user requesting to resend the email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The type of email to resend',
  })
  @IsEnum(OptionResendEmail)
  option: OptionResendEmail;
}
