import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { VnpayModule } from 'nestjs-vnpay';
import { ignoreLogger } from 'vnpay';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { B2Service } from 'src/storage-file/b2.service';
import { StorageFileModule } from 'src/storage-file/storage-file.module';
import { EventsModule } from 'src/events/events.module';
import { MailModule } from 'src/common/mail/mail.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    VnpayModule.register({
      tmnCode: process.env.TMN_CODE ?? '',
      secureSecret: process.env.SECURE_SECRET ?? 'YOUR_SECURE_SECRET',
      vnpayHost: 'https://sandbox.vnpayment.vn',

      // Cấu hình tùy chọn
      testMode: true,                // Chế độ test (ghi đè vnpayHost thành sandbox nếu là true)
      // hashAlgorithm: 'SHA512',       // Thuật toán mã hóa
      enableLog: true,               // Bật/tắt ghi log
      loggerFn: ignoreLogger,        // Hàm xử lý log tùy chỉnh
    }),
    InvoiceModule,
    StorageFileModule,
    EventsModule,
    MailModule,
    ClientsModule.register([
      {
        name: 'ORDER_EMAIL_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'order_completion_emails_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule { }
