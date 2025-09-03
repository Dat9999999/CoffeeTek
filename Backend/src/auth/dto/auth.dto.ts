import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class authLoginDto {
    @IsEmail()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}


export class authSignUpDto {
    @IsEmail()
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    firstName: string;

    @IsNotEmpty()
    lastName: string;
}