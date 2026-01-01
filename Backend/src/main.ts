import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './prisma/exception/PrismaExceptionFilter';
import { urlencoded } from 'express';
import { json } from 'express';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);



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
