import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { getRequest } from '../../shared/utils/get-request';
import { Request } from 'express';

export type Exceptions = HttpException | WsException;

@Catch(WsException, HttpException)
export class ExceptionsFilter implements ExceptionFilter {
  catch(exception: Exceptions, host: ArgumentsHost) {
    const request = getRequest<Socket | Request>(host);

    const statusCode = this.isHttpException(exception)
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const response = {
      statusCode,
      error: 'Error',
      message: exception.message,
      timestamp: Date.now() / 1000,
    };

    const error = this.isHttpException(exception)
      ? exception.getResponse()
      : exception.getError();

    if (typeof error === 'string') {
      response.message = error;
    } else {
      Object.assign(response, error);
    }

    switch (host.getType()) {
      case 'http':
        host
          .switchToHttp()
          .getResponse()
          .status(statusCode)
          .json(response);
        break;

      case 'ws':
        request.emit('exception', response);
        break;

      default:
        break;
    }

    return response;
  }

  isHttpException(err: Exceptions): err is HttpException {
    return err instanceof HttpException;
  }
}
