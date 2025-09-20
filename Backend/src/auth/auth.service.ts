import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { authAssignRoleDto, authChangePasswordDto, authForgetPasswordDto, authLoginDto, authSignUpDto } from './dto';
import * as argon from 'argon2';
import * as client from 'generated/prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/common/mail/mail.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {


    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService,
        private mailService: MailService,
        private redisService: RedisService
    ) { }
    async login(dto: authLoginDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                phone_number: dto.username,
            }
        })
        if (!user) throw new ForbiddenException("username doesn't exits or password is wrong!")
        const pwMatches = await argon.verify(user.hash, dto.password);

        if (!pwMatches) throw new ForbiddenException("username doesn't exits or password is wrong!")

        if (user.is_locked) throw new ForbiddenException("Account is locked. Please contact manager.");

        return this.signToken(user.id, user.phone_number);
    }
    async signup(dto: authSignUpDto) {
        const hash = await argon.hash(dto.password);

        const user = await this.prisma.user.create(
            {
                data: {
                    phone_number: dto.username,
                    hash: hash,
                    first_name: dto.firstName,
                    last_name: dto.lastName,
                    email: dto.email,
                    detail: {
                        // user details default 
                        create: {
                            birthday: new Date('2000-01-01'),
                            sex: 'other',
                            avatar_url: 'default.png',
                            address: 'Unknown',
                        }
                    },

                    //signup user with customer role
                    roles: {
                        connect: { role_name: 'customer' }
                    }
                }
            });
        return this.signToken(user.id, user.phone_number);
    }
    async signToken(userId: number, phone_number: string): Promise<{ access_token: string }> {
        const payload = { sub: userId, phone_number };
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: this.config.get('JWT_SECRET'),
        })
        return {
            access_token: token,
        }
    }

    async changePassword(user: client.User, dto: authChangePasswordDto) {
        if (dto.oldPassword === dto.newPassword) {
            throw new ForbiddenException("New password must be different from old password");
        }
        // const pwMatches = await argon.verify(user.hash, dto.oldPassword);
        const userUpdated = await this.prisma.user.findUnique({
            where: {
                id: user.id,
            }
        })
        if (!userUpdated) throw new ForbiddenException("User not found");

        const pwMatches = await argon.verify(userUpdated.hash, dto.oldPassword);

        if (!pwMatches) throw new ForbiddenException("Old password is incorrect");


        // update password
        const passwordUpdate = this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                hash: await argon.hash(dto.newPassword)
            },
            select: {
                id: true,
                phone_number: true,
                first_name: true,
                last_name: true,
            }
        })
        return passwordUpdate;
    }
    async forgetPassword(dto: authForgetPasswordDto) {
        //send email to user
        const otp = await this.redisService.createOTP(dto.email); // Create and store OTP in Redis
        await this.mailService.sendMail(dto.email, 'Password Reset', `Your OTP is: ${otp} . It will expire in 5 minutes.`);

        return { message: 'If the email is registered, a password reset link has been sent.' };
    }
    async resetPassword(dto: authForgetPasswordDto) {
        if (!dto.otp || !dto.newPassword) {
            throw new ForbiddenException("OTP and new password are required");
        }
        const verify = await this.redisService.validateOTP(dto.email, dto.otp);
        if (!verify) {
            throw new ForbiddenException("Invalid or expired OTP");
        }
        const { hash, ...update } = await this.prisma.user.update({
            where: {
                email: dto.email,
            },
            data: {
                hash: await argon.hash(dto.newPassword),
            }
        })
        return update;
    }
    editRole(dto: authAssignRoleDto, assign: Boolean) {
        const userUpdated = assign
            // assign role 
            ? this.prisma.user.update({
                where: {
                    id: dto.userId,
                },
                data: {
                    roles: {
                        connect: { role_name: dto.roleName }
                    }
                },
                select: {
                    id: true,
                    phone_number: true,
                    first_name: true,
                    last_name: true,
                    roles: true,
                }
            })
            // remove role
            : this.prisma.user.update({
                where: {
                    id: dto.userId,
                },
                data: {
                    roles: {
                        disconnect: { role_name: dto.roleName }
                    }
                },
                select: {
                    id: true,
                    phone_number: true,
                    first_name: true,
                    last_name: true,
                    roles: true,
                }
            })
        return userUpdated;
    }

}
