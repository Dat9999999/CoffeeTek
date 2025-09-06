import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorator';
import * as client from 'generated/prisma/client';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    getUsers(@GetUser() user: client.User) {
        return user;
    }
    @Get('hello')
    hello(): string {
        return this.userService.getHello();
    }
}
