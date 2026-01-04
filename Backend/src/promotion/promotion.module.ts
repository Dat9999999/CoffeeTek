import { Module } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { PromotionController } from './promotion.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [PrismaModule,
    ClientsModule.register([
      {
        name: 'PROMOTION_MAIL_SERVICE', // Define a name for the microservice
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://127.0.0.1:5672'], // IP and port of RabbitMQ server
          queue: 'promotion_emails_queue',
          queueOptions: {
            durable: true, // Queue will not lose data when RabbitMQ restarts
          },
        },
      },
    ]),
  ],
  controllers: [PromotionController],
  providers: [PromotionService],
})
export class PromotionModule { }
