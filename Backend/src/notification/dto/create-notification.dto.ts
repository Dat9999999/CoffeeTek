// src/notification/dto/create-notification.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { NotificationType } from 'src/common/enums/notificationType.enum';

export class CreateNotificationDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    message: string;

    @IsEnum(NotificationType)
    @IsNotEmpty()
    type: NotificationType;
}