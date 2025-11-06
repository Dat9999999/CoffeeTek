import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
const sgMail = require('@sendgrid/mail');

@Injectable()
export class MailService {
    private readonly fromEmail: string;
    private readonly apikey: string
    constructor() {
        if (process.env.SENDGRID_API_KEY == undefined) Logger.error(`lost sendgrid api key`)
        else {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY)
            this.apikey = process.env.SENDGRID_API_KEY
            this.fromEmail = process.env.EMAIL_FROM || ''
        }

    }
    async sendMail(toEmail: string, subject: string, htmlContent: string) {
        const msg = {
            to: toEmail,
            from: this.fromEmail, // PHẢI là email đã được xác minh
            subject: subject,
            html: htmlContent,
            // text: 'Nội dung dạng text...' // Nên có cho khả năng tương thích
        };

        try {
            await sgMail.send(msg);
            Logger.log(`Email was sent successfully to ${toEmail}`);
        } catch (error) {
            console.log(error)
            // Xử lý lỗi (ví dụ: throw exception)
            Logger.error('error when try to send');
        }
    }
}
