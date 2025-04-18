import { Global, Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { RequestContext } from './request-context';
@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls) => {
          cls.set('prismaTransactionClient', null);
        },
      },
    }),
  ],
  providers: [RequestContext],
  exports: [RequestContext],
})
export class RequestContextModule {}
