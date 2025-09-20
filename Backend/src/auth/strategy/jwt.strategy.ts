import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private config: ConfigService, private prisma: PrismaService) {
        super({
            //key of server 
            secretOrKey: config.get('JWT_SECRET'),

            // token from  client 
            jwtFromRequest:
                ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }
    async validate(payload: { sub: number, phone: string }): Promise<any> {
        const userRecord = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            include: {
                detail: true
            }
        });
        if (!userRecord) {
            return null;
        }
        const { hash, ...user } = userRecord;
        return user;
    }
}