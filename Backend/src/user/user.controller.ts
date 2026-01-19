import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorator';
import * as client from '@prisma/client';
import { UserService } from './user.service';
import { ChangeSensitiveInfoDTO, UserUpdateDTO } from './dto';
import { memoryStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetAllDto } from 'src/common/dto/pagination.dto';
import { Role } from 'src/auth/decorator/role.decorator';
import { RolesGuard } from 'src/auth/strategy/role.strategy';
import { v4 as uuid } from 'uuid';
import { B2Service } from 'src/storage-file/b2.service';

@Controller('user')

// comment when testing 


export class UserController {
  constructor(private readonly userService: UserService, private readonly b2Service: B2Service) { }

  //owner or manager only
  @Get('get-all')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Role('owner', 'manager')
  async getAllUsers(@Query() query: GetAllDto) {
    return await this.userService.getAllUsers(query);
  }
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getUsers(@GetUser() user: client.User) {
    return await this.userService.getUserProfile(user.id);
  }
  @Patch('update/:id')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) cb(new Error("only img"), false)
      else cb(null, true);
    },
    limits: { fileSize: 1024 * 1024 * 2 }
  }))
  async updateInfo(@Param('id', ParseIntPipe) id: number,
    @UploadedFile() avatar: Express.Multer.File,
    @Body() updateDto: UserUpdateDTO): Promise<string> {
    const key = `${uuid()}_${avatar.originalname}`
    const url_avt = await this.b2Service.uploadFile(key, avatar.buffer, avatar.mimetype);
    return await this.userService.updateInfo(id, updateDto, url_avt);
  }

  // @Get('me')
  // getUsers(@GetUser() user: client.User) {
  //   return user;
  // }

  @Patch('update/:id')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/'))
          cb(new Error('only img'), false);
        else cb(null, true);
      },
      limits: { fileSize: 1024 * 1024 * 2 },
    }),
  )
  // async updateInfo(
  //   @Param('id', ParseIntPipe) id: number,
  //   @UploadedFile() avatar: Express.Multer.File,
  //   @Body() updateDto: UserUpdateDTO,
  // ): Promise<string> {
  //   const key = `${uuid()}_${avatar.originalname}`;
  //   const url_avt = await this.b2Service.uploadFile(
  //     key,
  //     avatar.buffer,
  //     avatar.mimetype,
  //   );
  //   return await this.userService.updateInfo(id, updateDto, url_avt);
  // }



  @Delete('lock/:id')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Role('owner', 'manager')
  async lockUser(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.lockUser(id);
  }

  @Patch('unlock/:id')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Role('owner', 'manager')
  async unlockUser(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.unlockUser(id);
  }

  @Put('change-sensitive/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Role('owner', 'manager')
  async changeSensitiveInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ChangeSensitiveInfoDTO,
  ) {
    return await this.userService.changeSensitiveInfo(id, body);
  }

  @Get('search-pos')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  async getAllUsersForPos(@Query() query: GetAllDto) {
    return await this.userService.getAllUsersForPos(query);
  }
}
