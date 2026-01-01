import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { authAssignRoleDto, authChangePasswordDto, authForgetPasswordDto, authLoginDto, authSignUpDto, UpdateProfileDto } from './dto';
import * as argon from 'argon2';
import * as client from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/common/mail/mail.service';
import { RedisService } from 'src/redis/redis.service';
import { OAuth2Client } from 'google-auth-library';
import { FaceRecognitionService } from 'src/face-recognition/face-recognition.service';
@Injectable()
export class AuthService {
    private client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService,
        private mailService: MailService,
        private redisService: RedisService,
        private faceRecognitionService: FaceRecognitionService
    ) {
    }
    async login(dto: authLoginDto) {
        //cũ

        // const user = await this.prisma.user.findUnique({
        //     where: {
        //         phone_number: dto.username,
        //     }
        // })


        const username = dto.username.trim();

        // Xác định username là email hay số điện thoại
        const isEmail = username.includes('@');

        const user = await this.prisma.user.findUnique({
            where: isEmail
                ? { email: username }
                : { phone_number: username }
        });

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
                            address: dto.address ?? 'Unknown',
                        }
                    },

                    //signup user with customer role
                    roles: {
                        connect: { role_name: 'customer' }
                    },
                    // create customer point 
                    CustomerPoint: {
                        create: {
                            points: 0,
                            loyalLevel: {
                                connect: {
                                    id: 1
                                }
                            }
                        }
                    },

                },
                include: { roles: true, detail: true }

            });
        return this.signToken(user.id, user.phone_number);
    }
    async signToken(userId: number, phone_number: string): Promise<{ access_token: string }> {
        const payload = { sub: userId, phone_number };
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '1y',
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
        await this.mailService.sendMail(dto.email, 'CoffeeTek: Password Reset', `<div style="text-align: center; border: 1px solid #ccc; padding: 20px; max-width: 400px; margin: 20px auto; border-radius: 8px;">
    <h2 style="color: #4CAF50;">XÁC MINH OTP</h2>
    <p>Mã xác minh một lần (OTP) của bạn là:</p>

    <h1 style="color: #333; font-size: 32px; letter-spacing: 5px; margin: 20px 0; background-color: #f4f4f4; padding: 10px; border-radius: 4px;">
        ${otp}
    </h1>

    <p style="color: #777; font-size: 14px;">Mã này sẽ hết hạn trong 5 phút. Vui lòng nhập ngay để tiếp tục.</p>
    <hr style="border: 0; border-top: 1px solid #eee; margin-top: 20px;">
    <p style="font-size: 12px; color: #aaa;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
</div>`);

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

    async getAllRole() {
        return this.prisma.role.findMany({
            select: {
                id: true,
                role_name: true,
            },
            orderBy: {
                id: 'asc',
            },
        });
    }

    async googleLogin(token: string) {
        type UserWithRelation = client.Prisma.UserGetPayload<{
            include: { roles: true, detail: true }
        }>;

        let payload: any;

        try {
            const ticket = await this.client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_WEB_CLIENT_ID,
            });
            payload = ticket.getPayload();
            console.log(payload)
        } catch (error) {
            throw new ForbiddenException('Invalid Google token');
        }

        if (!payload?.email)
            throw new ForbiddenException('Google token payload missing email');

        let user: UserWithRelation | null = await this.prisma.user.findUnique({
            where: { email: payload.email },
            include: { roles: true, detail: true },
        });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: payload.email,
                    phone_number: `google_${payload.sub}`,
                    first_name: payload.family_name || 'Unknown',
                    last_name: payload.given_name || 'Unknown',
                    hash: payload.sub,

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
                    },
                    // create customer point 
                    CustomerPoint: {
                        create: {
                            points: 0,
                            loyalLevel: {
                                connect: {
                                    id: 1
                                }
                            }
                        }
                    },
                },
                include: { roles: true, detail: true },
            });
        }

        return this.signToken(user.id, user.phone_number);
    }


    async updateSecurity(userId: number, dto: UpdateProfileDto) {
        // 1. Lấy user hiện tại
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { detail: true }
        });

        if (!user) throw new NotFoundException('User not found');

        // 2. Kiểm tra số điện thoại đã tồn tại chưa
        if (dto.phone_number !== user.phone_number) {
            const existingPhone = await this.prisma.user.findUnique({
                where: { phone_number: dto.phone_number }
            });

            if (existingPhone) {
                throw new ForbiddenException('Phone number already in use');
            }
        }

        // 3. Hash mật khẩu mới 
        const hashedPassword = await argon.hash(dto.password);

        // 4. Cập nhật user + user_details
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                phone_number: dto.phone_number,
                hash: hashedPassword,
                detail: {
                    update: {
                        address: dto.address
                    }
                }
            },
            include: {
                detail: true
            }
        });
    }

    async checkFaceIDStatus(userId: number): Promise<{ hasFaceID: boolean }> {
        const faceID = await this.prisma.faceID.findUnique({
          where: { userId },
        });
        return { hasFaceID: !!faceID };
      }
    
      async registerFaceID(
        userId: number,
        phone: string,
        imageBase64: string,
      ): Promise<{ faceId: string }> {
        // Convert base64 to Buffer
        const base64Data = imageBase64.includes(',') 
          ? imageBase64.split(',')[1] 
          : imageBase64;
        const imageBuffer = Buffer.from(base64Data, 'base64');
    
        // Check if user already has Face ID
        const existingFaceID = await this.prisma.faceID.findUnique({
          where: { userId },
        });
    
        if (existingFaceID) {
          // Delete old face from AWS
          await this.faceRecognitionService.deleteFace(existingFaceID.faceId);
        }
    
        // Register face in AWS Rekognition
        const faceId = await this.faceRecognitionService.registerFace(imageBuffer, phone);
    
        // Save to database
        if (existingFaceID) {
          await this.prisma.faceID.update({
            where: { userId },
            data: {
              faceId,
              externalImageId: phone,
              updatedAt: new Date(),
            },
          });
        } else {
          await this.prisma.faceID.create({
            data: {
              faceId,
              collectionId: 'coffetek-faces',
              externalImageId: phone,
              userId,
            },
          });
        }
    
        return { faceId };
      }
    
      async updateFaceID(
        userId: number,
        phone: string,
        imageBase64: string,
      ): Promise<{ faceId: string }> {
        return this.registerFaceID(userId, phone, imageBase64);
      }
    
      async loginWithFaceID(imageBase64: string): Promise<{ phone: string; userId: number } | null> {
        const base64Data = imageBase64.includes(',') 
          ? imageBase64.split(',')[1] 
          : imageBase64;
        const imageBuffer = Buffer.from(base64Data, 'base64');
    
        const match = await this.faceRecognitionService.searchFace(imageBuffer);
    
        if (!match || match.similarity < 70) {
          return null;
        }
    
        const faceID = await this.prisma.faceID.findUnique({
          where: { faceId: match.faceId },
          include: { user: true },
        });
    
        if (!faceID) {
          return null;
        }
    
        return {
          phone: faceID.externalImageId,
          userId: faceID.userId,
        };
        }
}
