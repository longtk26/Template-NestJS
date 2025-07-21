import { Controller, Sse } from '@nestjs/common';
import { SSEService } from './sse.service';
import { Public } from '../guards/decorators/guard.decorator';

@Controller('sse')
export class SSEController {
  constructor(private readonly sseService: SSEService) {}

  // @Sse('job-translation')
  // @Public()
  // sseJobTranslation() {
  //   return this.sseService.getEventStream();
  // }

  @Sse('job-translation-v2')
  @Public()
  sseJobTranslationV2() {
    return this.sseService.getEventStreamBySubject('job-update');
  }
}
