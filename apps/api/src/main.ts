import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    
    // Enable CORS with production-ready configuration
    app.enableCors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    
    // Set global prefix
    app.setGlobalPrefix('api');
    
    // Enable validation globally with enhanced configuration
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.map(error => {
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
    }));
    
    // Get port from environment variable or use default
    const port = process.env.PORT || process.env.API_PORT || 8000;
    
    // Start the application
    await app.listen(port, '0.0.0.0'); // Listen on all network interfaces for production
    
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`📝 API Documentation available at: http://localhost:${port}/api`);
    logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Graceful shutdown handling
    const signals = ['SIGTERM', 'SIGINT'];
    signals.forEach(signal => {
      process.on(signal, async () => {
        logger.log(`Received ${signal}, starting graceful shutdown...`);
        await app.close();
        logger.log('Application closed successfully');
        process.exit(0);
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
    
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();