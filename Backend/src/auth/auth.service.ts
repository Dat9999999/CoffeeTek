import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { authLoginDto, authSignUpDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService,
    ) { }
    async login(dto: authLoginDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.username,
            }
        })
        if (!user) throw new ForbiddenException("Email doesn't exits or password is wrong!")
        const pwMatches = await argon.verify(user.hash, dto.password);

        if (!pwMatches) throw new ForbiddenException("Email doesn't exits or password is wrong!")

        return this.signToken(user.id, user.email);
    }
    async signup(dto: authSignUpDto) {
        const hash = await argon.hash(dto.password);
        const user = await this.prisma.user.create(
            {
                data: {
                    email: dto.username,
                    hash: hash,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                }
            });
        return this.signToken(user.id, user.email);
    }
    async signToken(userId: number, email: string): Promise<{ access_token: string }> {
        const payload = { sub: userId, email };
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: this.config.get('JWT_SECRET'),
        })
        return {
            access_token: token,
        }
    }
}
