import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { VnpayModule } from 'nestjs-vnpay';
import { ignoreLogger } from 'vnpay';

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
  })],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule { }
