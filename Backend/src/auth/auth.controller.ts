import { Body, Controller, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { authAssignRoleDto, authChangePasswordDto, authForgetPasswordDto, authLoginDto, authSignUpDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorator';
import * as client from 'generated/prisma/client';

@Controller('auth')
export class AuthController {
    constructor(private authservice: AuthService) { }
    @Post('login')
    login(@Body() dto: authLoginDto) {
        return this.authservice.login(dto);
    }

    @Post('signup')
    singup(@Body() dto: authSignUpDto) {
        return this.authservice.signup(dto);
    }
    @Post('change-password')
    @UseGuards(AuthGuard('jwt'))
    changePassword(@GetUser() user: client.User, @Body() dto: authChangePasswordDto) {
        return this.authservice.changePassword(user, dto);
    }
    @Post('forget-password')
    forgetPassword(@Body() dto: authForgetPasswordDto) {
        return this.authservice.forgetPassword(dto);
    }
    @Post('reset-password')
    resetPassword(@Body() dto: authForgetPasswordDto) {
        return this.authservice.resetPassword(dto);
    }
    @Put('assign-role')
    assignRole(@Body() dto: authAssignRoleDto) {
        return this.authservice.assignRole(dto);
    }

}
