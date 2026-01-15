import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { appConfig } from './config/app.config';

import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global prefix for all routes
  app.setGlobalPrefix(appConfig.apiPrefix);

  // Setup Views
  const viewsDir = join(process.cwd(), 'src', 'mail', 'templates');
  const distViewsDir = join(process.cwd(), 'dist', 'mail', 'templates');

  // Use dist if it exists (for build runs), fallback to src
  app.setBaseViewsDir([viewsDir, distViewsDir]);
  app.setViewEngine('hbs');

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

  // Logger
  app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'production')
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Swagger Configuration
  setupSwagger(app);

  await app.listen(appConfig.port);
  console.log(
    `🚀 School Management System running on: http://localhost:${appConfig.port}/api`,
  );
  console.log(
    `📚 Swagger Documentation available at: http://localhost:${appConfig.port}/api/docs`,
  );
}
bootstrap();
