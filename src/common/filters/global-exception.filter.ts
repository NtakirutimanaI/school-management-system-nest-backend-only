import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors: any = null;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                const responseObj = exceptionResponse as any;
                message = responseObj.message || message;
                errors = responseObj.errors || null;
            }
        } else if ((exception as any).code === '23505') {
            // Handle Postgres unique constraint violation
            status = HttpStatus.CONFLICT;
            // Extract the key that caused the violation if possible
            const detail = (exception as any).detail;
            message = detail ? `Duplicate entry: ${detail}` : 'Duplicate entry already exists';
        } else {
            // Log internal server errors
            console.error('💥 Internal Server Error:', exception);
        }

        response.status(status).json({
            success: false,
            statusCode: status,
            message: Array.isArray(message) ? message[0] : message,
            errors: errors || (Array.isArray(message) ? message : null),
            timestamp: new Date().toISOString(),
        });
    }
}
