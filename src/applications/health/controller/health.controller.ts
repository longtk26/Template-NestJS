import { Controller, Get, Request } from '@nestjs/common';
import { Public } from 'src/applications/guards/decorators/guard.decorator';

@Controller('health')
export class HealthController {
  constructor() {}

  @Get()
  // @Public()
  getHealth(@Request() req) {
    console.log('req', req.user);
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
