import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { StorageFileModule } from 'src/storage-file/storage-file.module';

@Module({
    imports: [StorageFileModule],
    controllers: [UploadController],
})
export class UploadModule { }
