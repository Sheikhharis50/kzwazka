import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Enable CORS with production-ready configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0) || ['http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Enable validation globally with enhanced configuration
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const constraints = error.constraints;
          if (constraints) {
            return Object.values(constraints).join(', ');
          }
          return `${error.property} has an invalid value`;
        });

        return new BadRequestException({
          message: 'Validation failed',
          errors: messages,
          statusCode: 400,
        });
      },
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Kzwazka API')
    .setDescription('Wrestling training management system API')
    .setVersion('1.0')
    .addTag('Children', 'Children management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth' // This name here is important for references
    )
    .addOAuth2(
      {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: 'https://accounts.google.com/o/oauth2/auth',
            tokenUrl: 'https://oauth2.googleapis.com/token',
            scopes: {
              email: 'Access to user email',
              profile: 'Access to user profile',
            },
          },
        },
      },
      'Google-OAuth2' // This name here is important for references
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Serve Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
    customSiteTitle: 'Kzwazka API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  // Get port from environment variable or use default
  const port = process.env.PORT || process.env.PORT || 8000;

  // Start the application
  await app.listen(port, '0.0.0.0'); // Listen on all network interfaces for production

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(
    `📝 API Documentation available at: http://localhost:${port}/api/docs`
  );
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Graceful shutdown handling
  const signals = ['SIGTERM', 'SIGINT'];
  signals.forEach((signal) => {
    process.on(signal, () => {
      logger.log(`Received ${signal}, starting graceful shutdown...`);
      app
        .close()
        .then(() => {
          logger.log('Application closed successfully');
          process.exit(0);
        })
        .catch((error) => {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        });
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});
