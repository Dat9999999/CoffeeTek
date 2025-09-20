import { Injectable } from "@nestjs/common";
import { ChangeSensitiveInfoDTO, UserUpdateDTO } from "./dto";
import { PrismaService } from "src/prisma/prisma.service";
import { GetAllDto } from "src/common/dto/pagination.dto";
import { Order } from "src/common/enums/order.enum";

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService
    ) {

    }
    async updateInfo(id: number, updateDto: UserUpdateDTO, avatar_url: string): Promise<string> {
        const userUpdated = await this.prisma.user.update({
            where: {
                id: id
            },
            data: {
                detail: {
                    update: {
                        address: updateDto.address,
                        sex: updateDto.sex,
                        birthday: updateDto.birthday,
                        avatar_url
                    }
                }
            }
        })
        return JSON.stringify(userUpdated);
    }
    async getAllUsers(query: GetAllDto) {
        const { page, size, searchName, orderBy } = query;
        if (!page || !size) {
            throw new Error("page and size are required");
        }

        const skip = (page - 1) * size;
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: size,
                where: searchName
                    ? { phone_number: { contains: searchName, mode: 'insensitive' } }
                    : {},
                select: {
                    id: true,
                    email: true,
                    phone_number: true,
                    detail: true,
                },
                orderBy: { id: orderBy }
            }),
            this.prisma.user.count(),
        ]);

        return { data, total, page, size };
    }
    async lockUser(id: number) {
        const user = await this.prisma.user.update({
            where: { id },
            // lock account
            data: { is_locked: true },
            select: {
                id: true,
                phone_number: true,
                first_name: true,
                last_name: true,
                is_locked: true,
                email: true,
            }
        })
        return user;
    }
    async unlockUser(id: number) {
        const user = await this.prisma.user.update({
            where: { id },
            // unlock account
            data: { is_locked: false },
            select: {
                id: true,
                phone_number: true,
                first_name: true,
                last_name: true,
                is_locked: true,
                email: true,
            }
        })
        return user;
    }
    changeSensitiveInfo(id: number, body: ChangeSensitiveInfoDTO) {
        const user = this.prisma.user.update({
            where: { id },
            data: {
                email: body.email,
                phone_number: body.phone
            }
        })

        return user;
    }
    getHello(): string {
        return 'Hello World!';
    }

}