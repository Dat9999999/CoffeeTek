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
import { UploadModule } from './upload-product-img/upload.module';
import { VnpayModule } from 'nestjs-vnpay';
import { ignoreLogger } from 'vnpay';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'uploads'),
    serveRoot: '/files'
  }),
    AuthModule, UserModule, PrismaModule, OrderModule,
    MailModule, RedisModule, OptionGroupsModule, OptionValuesModule,
    SizesModule, CategoriesModule, ToppingsModule, ProductsModule, UploadModule],
})
export class AppModule { }
