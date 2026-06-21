import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { devLogger } from '../logging/dev-logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const messageText =
      typeof message === 'string'
        ? message
        : typeof message === 'object' && message !== null && 'message' in message
          ? Array.isArray(message['message'])
            ? message['message'].join(', ')
            : String(message['message'])
          : 'Internal server error';

    if (status >= 500 || status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN) {
      devLogger.error(
        `${request.method} ${request.url}`,
        { status, message: messageText },
        exception,
      );
    }

    reply.status(status).send({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: messageText,
    });
  }
}
