import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { EventsModule } from 'src/events/events.module';

@Module({
    imports: [PrismaModule, EventsModule],
    controllers: [NotificationController],
    providers: [NotificationService],
})
export class NotificationModule { }
