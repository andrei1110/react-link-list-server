// src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
    }),
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(helmet());

  const isProd = process.env.NODE_ENV === 'production';

  app.enableCors({
    origin: isProd ? 'https://konn.com.br' : '*',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
