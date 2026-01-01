import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator'
import { Role } from 'src/common/enums/role.enum';
import { IsEmailOrPhone } from 'src/validators/is-email-or-phone.validator';

export class authLoginDto {
    @IsNotEmpty()
    @IsEmailOrPhone()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}


export class authSignUpDto {
    @IsNotEmpty({ message: 'Phone number is required' })
    @IsPhoneNumber('VN', { message: 'Invalid Vietnamese phone number' })
    username: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    firstName: string;

    @IsNotEmpty()
    lastName: string;

    @IsNotEmpty()
    address: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;
}
export class authChangePasswordDto {
    @IsNotEmpty()
    oldPassword: string;

    @IsNotEmpty()
    newPassword: string;
}

export class authForgetPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsOptional()
    @IsString()
    otp?: string;

    @IsOptional()
    @IsString()
    newPassword?: string;
}

export class authAssignRoleDto {
    @IsNotEmpty()
    @Type(() => Number)
    userId: number;

    @IsNotEmpty()
    //check role is valid
    @IsEnum(Role, { message: 'role must be one of manager, staff, customer, barista, baker, stocktaker, cashier' })
    roleName: string;
}


export class UpdateProfileDto {
    @IsNotEmpty({ message: 'Phone number is required' })
    @IsPhoneNumber('VN', { message: 'Invalid Vietnamese phone number' })
    phone_number: string;

    @IsNotEmpty({ message: 'Password is required' })
    @IsString()
    password: string;

    @IsNotEmpty({ message: 'Address is required' })
    @IsString()
    address: string;
}

export class FaceIDStatusResponseDto {
    hasFaceID: boolean;
}
