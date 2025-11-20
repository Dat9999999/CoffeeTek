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
import { ProductsModule } from './product/product.module';
import { UploadModule } from './upload-file/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { InvoiceModule } from './invoice/invoice.module';
import { MaterialModule } from './material/material.module';
import { RecipeModule } from './recipe/recipe.module';
import { UnitModule } from './unit/unit.module';
import { PromotionModule } from './promotion/promotion.module';
import { LoyalLevelModule } from './loyal-level/loyal-level.module';
import { VoucherModule } from './voucher/voucher.module';
import { ReportModule } from './report/report.module';
import { EventsModule } from './events/events.module';
import { MaterialLossModule } from './material-loss/material-loss.module';
import { MaterialRemainModule } from './material-remain/material-remain.module';
import { NotificationModule } from './notification/notification.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'public'), // Điều chỉnh rootPath
    // }),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'uploads'),
    //   serveRoot: '/uploads',
    // }),
    AuthModule,
    UserModule,
    PrismaModule,
    OrderModule,
    MailModule,
    RedisModule,
    OptionGroupsModule,
    OptionValuesModule,
    SizesModule,
    CategoriesModule,
    ProductsModule,
    UploadModule,
    InvoiceModule,
    MaterialModule,
    RecipeModule,
    UnitModule,
    PromotionModule,
    LoyalLevelModule,
    VoucherModule,
    ReportModule,
    MaterialLossModule,
    MaterialRemainModule,
    NotificationModule,
    EventsModule,
  ],
})
export class AppModule { }
