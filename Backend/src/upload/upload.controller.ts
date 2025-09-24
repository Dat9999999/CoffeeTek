import {
    Body,
    Controller,
    Post,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, parse } from 'path';
import { v4 as uuid } from 'uuid';

@Controller('upload')
export class UploadController {
    @Post('images')
    @UseInterceptors(
        FilesInterceptor('images', 20, {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const name = parse(file.originalname).name;
                    cb(null, `${name}__${uuid()}${extname(file.originalname)}`);
                },
            }),
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
        // Trả về danh sách tên file mới
        return files.map((file) => file.filename);
    }

}
