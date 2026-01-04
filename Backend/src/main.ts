import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './prisma/exception/PrismaExceptionFilter';
import { urlencoded } from 'express';
import { json } from 'express';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.MQ_URL || 'amqp://localhost:5672'],
        queue: 'promotion_emails_queue',
        noAck: false, // Force manual acknowledgment for safety
        prefetchCount: 1, // Process one job at a time to save CPU/RAM
        queueOptions: { durable: true },
      },
    },
  );

  await app.startAllMicroservices();

  // Increase body size limit (default 50MB, configurable via env)
  const bodySizeLimit = process.env.BODY_SIZE_LIMIT || '50mb';
  app.use(json({ limit: bodySizeLimit }));
  app.use(urlencoded({ extended: true, limit: bodySizeLimit }));

  // set global prefix
  app.setGlobalPrefix('api');

  // data validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) => {
        console.error('Validation errors:', errors); //  log ra terminal
        return new BadRequestException(errors);
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  //exception filter
  app.useGlobalFilters(new PrismaExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
