import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/applications/user/repository/user.repository';
import {
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
} from '../dto/auth.dto';
import { TokenRepository } from '../repository/token.repository';
import * as crypto from 'crypto';
import * as bcryptjs from 'bcryptjs';
import dayjs from 'dayjs';
import { Prisma, TokenType } from '@prisma/client';
import { MailService } from 'src/applications/mail/service/mail.service';
import { console } from 'inspector';
import { PinoLogger } from 'nestjs-pino';
import {
  Propagation,
  Transactional,
  TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly mailService: MailService,
    private readonly logger: PinoLogger,
    private readonly transactionHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async forgotPassword(data: ForgotPasswordRequestDto) {
    const user = await this.userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate a password reset token
    const token = await this.generatePasswordResetToken(user.id);

    this.mailService.sendMail({
      to: user.email,
      subject: 'YourAppName - Password Reset Request',
      content: '',
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f7f7f7; border-radius: 10px;">
            <h2 style="color: #2c3e50;">YourAppName Password Reset</h2>
            <p>Hello ${user.email || 'there'},</p>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://yourapp.com/reset-password?token=${token}" 
                 style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                Reset Your Password
              </a>
            </div>
            <p>If the button above doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">
              <a href="https://yourapp.com/reset-password?token=${token}">
                https://yourapp.com/reset-password?token=${token}
              </a>
            </p>
            <p><strong>Note:</strong> This link will expire in 1 hour for your security.</p>
            <hr style="border: none; border-top: 1px solid #ccc;">
            <p style="color: #888;">If you did not request this password reset, please ignore this email or contact support.</p>
            <p style="color: #888;">For your safety, never share your password reset link with anyone.</p>
            <p style="color: #888;">– The YourAppName Team</p>
          </div>
        `,
    });
  }

  @Transactional()
  async resetPassword(data: ResetPasswordRequestDto) {
    try {
      // Validate confirmation password
      if (data.password !== data.confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      const hashedToken = crypto
        .createHash('sha256')
        .update(data.token)
        .digest('hex');

      this.logger.debug(
        `Processing reset password with hashedToken: ${hashedToken}`,
      );

      const tokenInfo =
        await this.tokenRepository.findTokenByToken(hashedToken);

      if (!tokenInfo) {
        throw new BadRequestException('Invalid or expired token');
      }

      const hashedPassword = await bcryptjs.hash(data.password, 10);

      await this.userRepository.updateUser(tokenInfo.userId, {
        password: hashedPassword,
      });

      throw new BadRequestException('User not found');

      // Then delete the token - use the correct property
      await this.tokenRepository.delete({
        options: {
          id: tokenInfo.id, // Make sure this property name is correct
        },
      });

      // Send confirmation email
      return {
        message: 'Password reset successfully',
      };
    } catch (error) {
      // Log the error for debugging
      this.logger.error(
        `Error in resetPassword: ${error.message}`,
        error.stack,
      );

      // Re-throw the error to trigger transaction rollback
      throw error;
    }
  }

  private async generatePasswordResetToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    await this.tokenRepository.create({
      data: {
        token: hashedToken,
        user: {
          connect: {
            id: userId,
          },
        },
        expiredAt: dayjs().add(1, 'hour').toDate(),
        type: TokenType.RESET_PASSWORD,
      },
    });
    return token;
  }
}
