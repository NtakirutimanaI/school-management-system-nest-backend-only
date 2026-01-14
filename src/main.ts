import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { appConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for all routes
  app.setGlobalPrefix(appConfig.apiPrefix);

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global response interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger Configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('School Management System API')
    .setDescription(`
## 🎓 School Management System - REST API Documentation

A comprehensive school management system API built with NestJS, TypeScript, PostgreSQL, and TypeORM.

### Features:
- **Authentication & Authorization** - JWT-based authentication with role-based access control
- **User Management** - Manage admins, teachers, parents, and students
- **Student Management** - Student profiles, enrollment, and records
- **Teacher Management** - Teacher profiles and class assignments
- **Class Management** - Classes, grades, and academic structures
- **Subject Management** - Curriculum and subject assignments
- **Enrollment Management** - Student enrollment in classes
- **Attendance Tracking** - Daily attendance records
- **Exam Management** - Exam scheduling and management
- **Results Management** - Grade recording and report cards
- **Fee Management** - Fee structures and payment tracking
- **Notifications** - System-wide notifications

### Authentication:
All protected endpoints require a valid JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

### Default Credentials:
- **Admin**: admin@school.com / admin123
- **Teacher**: teacher@school.com / teacher123
- **Student**: student@school.com / student123
    `)
    .setVersion('1.0.0')
    .setContact(
      'School Management Team',
      'https://school-management.com',
      'support@school-management.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Development Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication endpoints - Login, Register, Profile')
    .addTag('Users', 'User management endpoints')
    .addTag('Students', 'Student management endpoints')
    .addTag('Teachers', 'Teacher management endpoints')
    .addTag('Classes', 'Class and grade management endpoints')
    .addTag('Subjects', 'Subject and curriculum management endpoints')
    .addTag('Enrollments', 'Student enrollment management endpoints')
    .addTag('Attendance', 'Attendance tracking endpoints')
    .addTag('Exams', 'Exam management endpoints')
    .addTag('Results', 'Exam results and grades endpoints')
    .addTag('Fees', 'Fee and payment management endpoints')
    .addTag('Notifications', 'Notification system endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'School Management API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #3b82f6 }
      .swagger-ui .scheme-container { background: #f8fafc; padding: 15px; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  await app.listen(appConfig.port);
  console.log(`🚀 School Management System running on: http://localhost:${appConfig.port}/api`);
  console.log(`📚 Swagger Documentation available at: http://localhost:${appConfig.port}/api/docs`);
}
bootstrap();
