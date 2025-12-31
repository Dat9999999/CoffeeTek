import { Body, Controller, Get, ParseBoolPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { authAssignRoleDto, authChangePasswordDto, authForgetPasswordDto, authLoginDto, authSignUpDto, UpdateProfileDto, FaceIDStatusResponseDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorator';
import * as client from '@prisma/client';
import { Role } from './decorator/role.decorator';
import { RolesGuard } from './strategy/role.strategy';

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

    // only owner or manager can assign or remove role for user
    @Put('edit-role')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    // @Role('owner', 'manager')
    editRole(@Body() dto: authAssignRoleDto, @Query('assign', new ParseBoolPipe) assign: boolean = true) {
        return this.authservice.editRole(dto, assign);
    }

    ///
    @Get('roles')
    async getAllRole() {
        return this.authservice.getAllRole();
    }


    @Post('google')
    async googleLogin(@Body('token') token: string) {
        return this.authservice.googleLogin(token);
    }

    @Put('security')
    @UseGuards(AuthGuard('jwt'))
    updateProfile(
        @GetUser() user: client.User,
        @Body() dto: UpdateProfileDto
    ) {
        return this.authservice.updateSecurity(user.id, dto);
    }

    @Post('face-id/register')
    // @UseGuards(AuthGuard('jwt'))
    registerFaceID() {
        return "calling register face id";
    }

    @Get('face-id/status')
    // @UseGuards(AuthGuard('jwt'))
    getFaceIDStatus(): FaceIDStatusResponseDto {
        return { hasFaceID: false };
    }
    // @Put('face-id/update')
    // @UseGuards(AuthGuard('jwt'))
    // updateFaceID(@GetUser() user: client.User, @Body() dto: authUpdateFaceIDDto) {
    //     return this.authservice.updateFaceID(user.id, dto);
    // }
}
