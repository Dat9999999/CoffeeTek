import {
    Body,
    Controller,
    Post,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { extname, parse } from 'path';
import { B2Service } from 'src/storage-file/b2.service';
import { v4 as uuid } from 'uuid';

@Controller('upload')
export class UploadController {
    constructor(private readonly b2Service: B2Service) {

    }
    @Post('images')
    @UseInterceptors(
        FilesInterceptor('images', 20, {
            storage: memoryStorage(),
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.startsWith('image/')) {
                    return cb(new Error('Only image files are allowed!'), false);
                }
                cb(null, true);
            },
            limits: { fileSize: 1024 * 1024 * 10 }, // max 10MB/file
        }),
    )
    async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
        const results = await Promise.all(
            files.map(async (file) => {
                const key = `${uuid()}__${file.originalname}`;
                return this.b2Service.uploadFile(key, file.buffer, file.mimetype);
            }),
        );

        return results;
    }

}
