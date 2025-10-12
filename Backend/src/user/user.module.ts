import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { StorageFileModule } from 'src/storage-file/storage-file.module';

@Module({
  imports: [StorageFileModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
