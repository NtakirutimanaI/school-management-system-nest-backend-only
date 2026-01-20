import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Configuration
import { throttlerConfig } from './config/throttler.config';
import { winstonConfig } from './config/logger.config';

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { ClassesModule } from './classes/classes.module';
import { SubjectsModule } from './subjects/subjects.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ExamsModule } from './exams/exams.module';
import { ResultsModule } from './results/results.module';
import { FeesModule } from './fees/fees.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MailModule } from './mail/mail.module';
import { SocketsModule } from './common/sockets/sockets.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { HealthModule } from './health/health.module';
import { SchoolsModule } from './schools/schools.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { CalendarModule } from './calendar/calendar.module';
import { TimetableModule } from './timetable/timetable.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { MaterialsModule } from './materials/materials.module';
import { ResourceRequestsModule } from './resource-requests/resource-requests.module';
import { DisciplineModule } from './discipline/discipline.module';
import { LibraryModule } from './library/library.module';

// Audit Logging
import { AuditLog } from './common/entities/audit-log.entity';
import { AuditLogService } from './common/services/audit-log.service';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';

@Module({
  imports: [
    // Global Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),

    // Winston Logger
    WinstonModule.forRoot(winstonConfig),

    // Rate Limiting (Throttler)
    ThrottlerModule.forRoot(throttlerConfig),

    // BullMQ for Background Jobs
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        if (cfg.get('USE_REDIS_MOCK') === 'true') {
          const Mock = require('ioredis-mock');
          return { connection: new Mock() };
        }
        return {
          connection: {
            host: cfg.get('REDIS_HOST', 'localhost'),
            port: cfg.get('REDIS_PORT', 6379),
            password: cfg.get('REDIS_PASSWORD'),
          },
        };
      },
    }),

    // Scheduler
    ScheduleModule.forRoot(),

    // Event Emitter
    EventEmitterModule.forRoot(),

    // TypeORM Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST', 'localhost'),
        port: cfg.get('DB_PORT', 5432),
        username: cfg.get('DB_USER', 'postgres'),
        password: cfg.get('DB_PASSWORD', 'postgres'),
        database: cfg.get('DB_NAME', 'school_management'),
        autoLoadEntities: true,
        synchronize: cfg.get('NODE_ENV') === 'development',
        logging: cfg.get('NODE_ENV') === 'development',
      }),
    }),

    // Audit Log Entity Registration
    TypeOrmModule.forFeature([AuditLog]),

    // Feature Modules
    AuthModule,
    UsersModule,
    SchoolsModule,
    StudentsModule,
    TeachersModule,
    ClassesModule,
    SubjectsModule,
    EnrollmentsModule,
    AttendanceModule,
    ExamsModule,
    ResultsModule,
    FeesModule,
    NotificationsModule,
    MailModule,
    SocketsModule,
    CloudinaryModule,
    HealthModule,
    AssessmentsModule,
    SuperAdminModule,
    CalendarModule,
    TimetableModule,
    AnnouncementsModule,
    MaterialsModule,
    ResourceRequestsModule,
    DisciplineModule,
    LibraryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuditLogService,
    // Global Rate Limiting Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global Audit Log Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule { }
