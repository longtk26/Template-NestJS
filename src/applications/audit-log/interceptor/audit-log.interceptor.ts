import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from '../service/audit-log.service';
import { PinoLogger } from 'nestjs-pino';
import { UserRequest } from '../../user/interface/user.interface';
import { UserService } from '../../user/service/user.service';

const AUDIT_LOG_DATA = 'AUDIT_LOG_DATA';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
    private readonly userService: UserService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuditLogInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const actionTemplate = this.reflector.get<string>(
      AUDIT_LOG_DATA,
      context.getHandler(),
    );

    if (!actionTemplate) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<UserRequest>();
    const userId = request.user?.userId;

    if (!userId) {
      this.logger.warn('No user ID found in request for audit logging');
      return next.handle();
    }

    // Extract any parameters from the request that might be used in the template
    const requestBody = request.body;
    const requestParams = request.params;
    const method = request.method;

    return next.handle().pipe(
      tap(async (response) => {
        try {
          // Parse the action template to replace placeholders with actual values
          let description = actionTemplate;

          // Replace <name_admin> with the admin's name - fetch from the authenticated user
          try {
            const adminUser = await this.userService.getUserById(userId);
            if (adminUser && adminUser.name) {
              description = description.replace('<name_admin>', adminUser.name);
            }
          } catch (error) {
            this.logger.error(`Failed to fetch admin user: ${error.message}`);
          }

          // For target objects like <name_user>, try to find it in the request body or response
          if (requestBody && requestBody.firstName) {
            description = description.replace(
              '<name_user>',
              requestBody.firstName,
            );
          } else if (response && response.data.email) {
            description = description.replace(
              '<name_user>',
              response.data.email,
            );
          }

          // Add timestamp
          const timestamp = new Date().toISOString();
          description = description.replace('<timestamp>', `${timestamp}`);

          // Determine action type based on route or method
          const handler = context.getHandler();
          const controllerName = context.getClass().name;
          let action = 'USER_ACTION';
          console.log(`Handler: ${handler.name}`);
          console.log(`Controller: ${controllerName}`);

          if (method === 'POST') {
            action = 'CREATED';
          } else if (method === 'PUT' || method === 'PATCH') {
            action = 'UPDATED';
          } else if (method === 'DELETE') {
            action = 'DELETED';
          } else if (method === 'GET') {
            action = 'RETRIEVED';
          }

          await this.auditLogService.createLog({
            action,
            description,
            userId,
            targetId: response?.data?.id || requestParams?.id, // Either from response or URL params
            targetType: 'user', // This could be determined more dynamically
            metadata: {
              requestBody,
              responseData: response?.data,
              requestParams,
            },
          });
        } catch (error) {
          this.logger.error(`Error in audit logging: ${error.message}`);
        }
      }),
    );
  }
}
