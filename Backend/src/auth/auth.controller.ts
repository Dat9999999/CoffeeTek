import { BadRequestException, Body, Controller, Get, ParseBoolPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { authAssignRoleDto, authChangePasswordDto, authForgetPasswordDto, authLoginDto, authSignUpDto, UpdateProfileDto, FaceIDStatusResponseDto, RegisterFaceIDDto, UpdateFaceIDDto, LoginFaceIDDto } from './dto';
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

  @Get('face-id/status')
  @UseGuards(AuthGuard('jwt'))
  async getFaceIDStatus(@GetUser() user: client.User): Promise<FaceIDStatusResponseDto> {
    return this.authservice.checkFaceIDStatus(user.id);
    }

    @Post('face-id/register')
  @UseGuards(AuthGuard('jwt'))
  async registerFaceID(
    @GetUser() user: client.User,
    @Body() dto: RegisterFaceIDDto,
  ) {
    return this.authservice.registerFaceID(user.id, dto.phone, dto.image);
    }

  @Put('face-id/update')
  @UseGuards(AuthGuard('jwt'))
  async updateFaceID(
    @GetUser() user: client.User,
    @Body() dto: UpdateFaceIDDto,
  ) {
    return this.authservice.updateFaceID(user.id, dto.phone, dto.image);
  }

  @Post('face-id/login')
  async loginWithFaceID(@Body() dto: LoginFaceIDDto) {
    const result = await this.authservice.loginWithFaceID(dto.image);
    if (!result) {
      throw new BadRequestException('Face not recognized');
    }
    return result;
  }
}
