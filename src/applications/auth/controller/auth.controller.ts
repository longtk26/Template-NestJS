import { Body, Controller, Post } from '@nestjs/common';
import {
  ForgotPasswordRequestDto,
  ResendEmailDto,
  ResetPasswordRequestDto,
} from '../dto/auth.dto';
import { AuthService } from '../service/auth.service';
import { Public } from 'src/applications/guards/decorators/guard.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('forgot-password')
  @Public()
  async forgotPassword(@Body() body: ForgotPasswordRequestDto) {
    await this.authService.forgotPassword(body);
    return {
      message: 'Password reset email sent successfully',
    };
  }

  @Post('reset-password')
  @Public()
  async resetPassword(@Body() body: ResetPasswordRequestDto) {
    await this.authService.resetPassword(body);
    return {
      message: 'Password reset successfully',
    };
  }

  @Public()
  @Post('resend-email')
  async resendEmail(@Body() body: ResendEmailDto) {
    await this.authService.resendEmail(body);
    return {
      message: 'Email resent successfully',
    };
  }
}
