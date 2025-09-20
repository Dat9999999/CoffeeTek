import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    constructor(@InjectRedis() private readonly redis: Redis) { }

    async createOTP(email: string): Promise<String> {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const key = `otp:${email}`;
        await this.redis.set(key, otp, 'EX', 300); // OTP expires in 5 minutes
        return otp;
    }

    async validateOTP(email: String, otp: String): Promise<boolean> {
        const key = `otp:${email}`;
        const storedOtp = await this.redis.get(key);
        if (!storedOtp) return false; // OTP expired or doesn't exist
        if (storedOtp !== otp) return false; // OTP doesn't match
        await this.redis.del(key); // OTP can be used only once
        return true;
    }

}
