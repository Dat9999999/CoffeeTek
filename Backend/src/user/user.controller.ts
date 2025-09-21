import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorator';
import * as client from '@prisma/client';
import { UserService } from './user.service';
import { ChangeSensitiveInfoDTO, UserUpdateDTO } from './dto';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetAllDto } from 'src/common/dto/pagination.dto';
import { Role } from 'src/auth/decorator/role.decorator';
import { RolesGuard } from 'src/auth/strategy/role.strategy';

@Controller('user')

// comment when testing 
@UseGuards(AuthGuard('jwt'))

export class UserController {
    constructor(private readonly userService: UserService) { }
    @Get('me')
    getUsers(@GetUser() user: client.User) {
        return user;
    }
    @Patch('update/:id')
    @UseInterceptors(FileInterceptor('avatar', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const extension = file.originalname.split('.').pop();
                cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) cb(new Error("only img"), false)
            else cb(null, true);
        },
        limits: { fileSize: 1024 * 1024 * 2 }
    }))
    async updateInfo(@Param('id', ParseIntPipe) id: number,
        @UploadedFile() avatar: Express.Multer.File,
        @Body() updateDto: UserUpdateDTO): Promise<string> {
        return await this.userService.updateInfo(id, updateDto, avatar.filename);
    }


    //owner or manager only
    @Get('get-all')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Role('owner', 'manager')
    async getAllUsers(@Query() query: GetAllDto) {
        return await this.userService.getAllUsers(query);
    }
    @Delete('lock/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Role('owner', 'manager')
    async lockUser(@Param('id', ParseIntPipe) id: number) {
        return await this.userService.lockUser(id);
    }
    @Patch('unlock/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Role('owner', 'manager')
    async unlockUser(@Param('id', ParseIntPipe) id: number) {
        return await this.userService.unlockUser(id);
    }

    @Put('change-sensitive/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Role('owner', 'manager')
    async changeSensitiveInfo(@Param('id', ParseIntPipe) id: number, @Body() body: ChangeSensitiveInfoDTO) {
        return await this.userService.changeSensitiveInfo(id, body);
    }
}
