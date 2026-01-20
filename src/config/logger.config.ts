import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';

const logDir = path.join(process.cwd(), 'logs');

// Custom log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, context, trace }) => {
        return `${timestamp} [${context || 'Application'}] ${level}: ${message}${trace ? `\n${trace}` : ''
            }`;
    }),
);

export const winstonConfig: WinstonModuleOptions = {
    transports: [
        // Console transport for development
        new winston.transports.Console({
            format: consoleFormat,
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        }),

        // Error log file
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            format: logFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),

        // Combined log file
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            format: logFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),

        // Audit log file (for sensitive operations)
        new winston.transports.File({
            filename: path.join(logDir, 'audit.log'),
            level: 'info',
            format: logFormat,
            maxsize: 10485760, // 10MB
            maxFiles: 10,
        }),
    ],

    // Exception handling
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'exceptions.log'),
            format: logFormat,
        }),
    ],

    // Rejection handling
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'rejections.log'),
            format: logFormat,
        }),
    ],
};

// Export logger instance for direct use
export const logger = winston.createLogger(winstonConfig);
