import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';

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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    BullModule.forRootAsync({
      imports: [ConfigModule], inject: [ConfigService],
      useFactory: (cfg) => {
        if (cfg.get('USE_REDIS_MOCK') === 'true') {
          const Mock = require('ioredis-mock');
          return { connection: new Mock() };
        }
        return { connection: { host: cfg.get('REDIS_HOST', 'localhost'), port: cfg.get('REDIS_PORT', 6379) } };
      },
    }),
    ScheduleModule.forRoot(), EventEmitterModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], inject: [ConfigService],
      useFactory: (cfg) => ({
        type: 'postgres', host: cfg.get('DB_HOST', 'localhost'), port: cfg.get('DB_PORT', 5432),
        username: cfg.get('DB_USER', 'postgres'), password: cfg.get('DB_PASSWORD', 'postgres'),
        database: cfg.get('DB_NAME', 'school_management'), autoLoadEntities: true,
        synchronize: cfg.get('NODE_ENV') === 'development',
      }),
    }),
    AuthModule, UsersModule, StudentsModule, TeachersModule, ClassesModule, SubjectsModule,
    EnrollmentsModule, AttendanceModule, ExamsModule, ResultsModule, FeesModule, NotificationsModule, MailModule, SocketsModule, CloudinaryModule,
  ],
  controllers: [AppController], providers: [AppService],
})
export class AppModule { }
