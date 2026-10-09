import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ApiResponse {
  success: boolean;
  error?: string;
  message?: string;
  statusCode: number;
  timestamp: string;
  requestId?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  AUTH_REQUIRED: 'Please log in to continue',
  INVALID_CREDENTIALS: 'Invalid username or password',
  SESSION_EXPIRED: 'Your session has expired. Please log in again',
  ACCOUNT_LOCKED: 'Account temporarily locked due to too many failed attempts',
  VALIDATION_ERROR: 'Please check your input and try again',
  INTERNAL_ERROR: 'Something went wrong. Please try again later',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment',
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_ERROR';
    let message = ERROR_MESSAGES['INTERNAL_ERROR'];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = this.sanitizeMessage(exceptionResponse);
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;
        message = this.sanitizeMessage((resp.message as string) || message);
        errorCode = (resp.error as string) || this.getErrorCode(status);
      }
    } else if (exception instanceof Error) {
      
      const requestId = (request as any).requestId || 'unknown';
      console.error(`[${requestId}] Internal Error:`, {
        message: exception.message,
        stack: exception.stack,
        path: request.path,
        method: request.method,
      });
      message = ERROR_MESSAGES['INTERNAL_ERROR'];
      errorCode = 'INTERNAL_ERROR';
    }

    const errorResponse: ApiResponse = {
      success: false,
      error: errorCode,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      requestId: (request as any).requestId,
    };

    response.status(status).json(errorResponse);
  }

  private sanitizeMessage(message: string): string {
    if (message.includes('SELECT') || message.includes('INSERT')) {
      return ERROR_MESSAGES['INTERNAL_ERROR'];
    }
    if (message.includes('password') || message.includes('hash')) {
      return ERROR_MESSAGES['INVALID_CREDENTIALS'];
    }
    for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    if (message.length > 200) {
      return message.substring(0, 200) + '...';
    }
    return message;
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case 400: return 'BAD_REQUEST';
      case 401: return 'UNAUTHORIZED';
      case 403: return 'FORBIDDEN';
      case 404: return 'NOT_FOUND';
      case 429: return 'RATE_LIMIT_EXCEEDED';
      case 500: return 'INTERNAL_ERROR';
      default: return 'ERROR';
    }
  }
}
