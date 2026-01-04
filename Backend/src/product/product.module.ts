import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsController } from './product.controller';
import { ProductsService } from './product.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService, RedisService],
})
export class ProductsModule {}
