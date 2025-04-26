import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger as LoggerPino } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import { settingSwagger } from './config/swagger';
import { ConfigEnum } from './config/config';
import { BrokerConfig, JwtConfig } from './config/interface';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(LoggerPino));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // This removes properties that don't have decorators in the DTO
      forbidNonWhitelisted: true, // This throws an error if unexpected properties are provided
      transform: true, // This transforms the objects to be instances of their class
    }),
  );

  settingSwagger(app);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000, () => {
    // Using pino logger
    app
      .get(LoggerPino)
      .log('Template app is running on port ' + process.env.PORT);
  });
}

bootstrap();
