import { File } from "buffer";
import { IsDate, IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString } from "class-validator";
import { Sex } from "src/common/enums/sex.enum";

export class UserUpdateDTO {
    @IsOptional()
    @IsDate()
    birthday?: Date;
    @IsOptional()
    @IsEnum(Sex)
    sex?: Sex;

    avatar?: File; // handle trong controller

    @IsOptional()
    @IsString()
    address?: string;
}

export class ChangeSensitiveInfoDTO {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @IsPhoneNumber("VN")
    phone?: string;
}