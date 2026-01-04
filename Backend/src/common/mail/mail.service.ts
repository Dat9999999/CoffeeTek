import { Injectable, Logger } from '@nestjs/common';
// const sgMail = require('@sendgrid/mail');
import { Resend } from 'resend';

@Injectable()
export class MailService {
    private readonly fromEmail: string;
    private readonly apiKey: string;
    private resend: Resend;
    constructor() {
        this.apiKey = process.env.RESEND_API_KEY || '';
        this.resend = new Resend(this.apiKey);
        this.fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
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
            const result = await this.resend.emails.send(msg);
            Logger.log('Email sent result:', result);
            Logger.log(`Email was sent successfully to ${toEmail}`);
        } catch (error) {
            // Xử lý lỗi (ví dụ: throw exception)
            throw error;
            Logger.error('error when try to send');
        }
    }
}
