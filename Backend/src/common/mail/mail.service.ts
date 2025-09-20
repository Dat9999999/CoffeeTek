import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        })
    }
    async sendMail(to: string, subject: string, html: string) {
        await this.transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
        }, (err, info) => {
            if (err) {
                console.log('Error occurred. ' + err.message);
                return;
            }
            console.log('Message sent: %s', info.messageId);
        });
    }
}
