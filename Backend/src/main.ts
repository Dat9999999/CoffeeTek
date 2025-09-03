import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './prisma/exception/PrismaExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // data validation
  app.useGlobalPipes(new ValidationPipe());


  //exception filter
  app.useGlobalFilters(new PrismaExceptionFilter())
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
