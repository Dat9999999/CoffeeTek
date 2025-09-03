import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorator';
import * as client from 'generated/prisma/client';

@Controller('user')
export class UserController {
    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    getUsers(@GetUser() user: client.User) {
        return user;
    }
}
