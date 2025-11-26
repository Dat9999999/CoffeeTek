// src/notification/notification.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    ParseIntPipe,
    ValidationPipe
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { GetUser } from 'src/auth/decorator';
import { AuthGuard } from '@nestjs/passport';
import { GetNotificationsDto } from './dto/get-notifications.dto';


@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    // API nội bộ hoặc Admin dùng để bắn thông báo thủ công (nếu cần)
    @Post()
    create(@Body() createNotificationDto: CreateNotificationDto) {
        return this.notificationService.create(createNotificationDto);
    }

    // Lấy danh sách thông báo của User đang đăng nhập
    @Get()
    findAll(
        @GetUser('id') userId: number,
        @Query(new ValidationPipe({ transform: true })) query: GetNotificationsDto,
    ) {
        // query.page, query.size, query.isRead đã được tự động convert đúng kiểu dữ liệu
        return this.notificationService.findAllByUser(
            userId,
            query.page,
            query.size,
            query.type,
            query.isRead
        );
    }

    // Lấy số lượng chưa đọc (để hiện badge đỏ trên UI)
    @Get('unread-count')
    getUnreadCount(@GetUser('id') userId: number) {
        return this.notificationService.countUnread(userId);
    }

    // Đánh dấu tất cả là đã đọc
    @Patch('read-all')
    markAllAsRead(@GetUser('id') userId: number) {
        return this.notificationService.markAllAsRead(userId);
    }

    // Đánh dấu 1 cái là đã đọc
    @Patch(':id/read')
    markAsRead(
        @Param('id', ParseIntPipe) id: number,
        @GetUser('id') userId: number,
    ) {
        return this.notificationService.markAsRead(id, userId);
    }

    // Xóa 1 thông báo
    @Delete(':id')
    remove(
        @Param('id', ParseIntPipe) id: number,
        @GetUser('id') userId: number,
    ) {
        return this.notificationService.remove(id, userId);
    }
}