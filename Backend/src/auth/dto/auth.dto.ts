import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator'

export class authLoginDto {
    @IsPhoneNumber('VN')
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}


export class authSignUpDto {
    @IsPhoneNumber('VN')
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    firstName: string;

    @IsNotEmpty()
    lastName: string;

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
    userId: number;

    @IsNotEmpty()
    roleName: string;
}