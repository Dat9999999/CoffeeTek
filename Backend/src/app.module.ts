import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from './order/order.module';
import { MailModule } from './common/mail/mail.module';
import { RedisModule } from './redis/redis.module';
import { OptionGroupsModule } from './option-groups/option-groups.module';
import { OptionValuesModule } from './option-values/option-values.module';
import { SizesModule } from './sizes/sizes.module';
import { CategoriesModule } from './categories/categories.module';
import { ToppingsModule } from './toppings/toppings.module';
import { ProductsModule } from './product/product.module';
import { UploadModule } from './upload/upload.module';
import { VnpayModule } from 'nestjs-vnpay';
import { ignoreLogger } from 'vnpay';
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
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
    AuthModule, UserModule, PrismaModule, OrderModule,
    MailModule, RedisModule, OptionGroupsModule, OptionValuesModule,
    SizesModule, CategoriesModule, ToppingsModule, ProductsModule, UploadModule],
})
export class AppModule { }
