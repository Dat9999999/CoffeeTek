import { Injectable, Logger } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'


@Injectable()
export class B2Service {
    private s3: S3Client;
    private bucket: string;
    private endpoint: string;
    constructor() {
        this.bucket = process.env.B2_BUCKET ?? 'Your bucket name';
        this.endpoint = process.env.B2_ENDPOINT ?? 'Your endpoint';
        this.s3 = new S3Client({
            region: process.env.B2_REGION,
            endpoint: this.endpoint,
            credentials: {
                accessKeyId: process.env.B2_KEY_ID ?? 'key Id',
                secretAccessKey: process.env.B2_APP_KEY ?? 'app key',
            }
        })
    }

    async uploadFile(key: string, fileBuffer: Buffer, contentType?: string) {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType || 'application/octet-stream'
        })
        await this.s3.send(command);
        Logger.log(`upload file to bucket, url file = ${process.env.B2_PUBLIC_URL}/${key}`);
        return `${key}`;
    }
}
