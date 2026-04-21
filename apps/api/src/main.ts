import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { devLogger } from './common/logging/dev-logger';

type RequestWithTiming = {
  method: string;
  url: string;
  ip?: string;
  startedAt?: number;
};

type ReplyWithStatus = {
  statusCode: number;
};

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3001;
  const allowedOrigins = configService.get<string[]>('allowedOrigins') ?? ['http://localhost:3000'];
  const fastify = app.getHttpAdapter().getInstance();

  fastify.addHook('onRequest', (request: RequestWithTiming, _reply: unknown, done: () => void) => {
    request.startedAt = Date.now();
    devLogger.request(`${request.method} ${request.url}`, {
      ip: request.ip,
    });
    done();
  });

  fastify.addHook('onResponse', (request: RequestWithTiming, reply: ReplyWithStatus, done: () => void) => {
    const durationMs = request.startedAt ? Date.now() - request.startedAt : undefined;
    devLogger.response(`${request.method} ${request.url}`, {
      status: reply.statusCode,
      durationMs,
    });
    done();
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const nodeEnv = configService.get<string>('nodeEnv') ?? 'development';
  app.enableCors({
    // Dev: allow web app, browser extension (chrome-extension://), and curl; prod: explicit allowlist.
    origin: nodeEnv === 'development' ? true : allowedOrigins,
    credentials: true,
  });

  await app.listen(port, '0.0.0.0');
  devLogger.bootstrap(`API running on http://localhost:${port}/api/v1`);
}

bootstrap();
