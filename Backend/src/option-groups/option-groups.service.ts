import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OptionGroupsService {
    constructor(private prisma: PrismaService) { }

    create(name: string) {
        return this.prisma.optionGroup.create({
            data: { name },
        });
    }

    async findAll(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.optionGroup.findMany({
                skip,
                take: limit,
                orderBy: { id: 'asc' },
            }),
            this.prisma.optionGroup.count(),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    findOne(id: number) {
        return this.prisma.optionGroup.findUnique({
            where: { id },
        });
    }

    update(id: number, name: string) {
        return this.prisma.optionGroup.update({
            where: { id },
            data: { name },
        });
    }

    remove(id: number) {
        return this.prisma.optionGroup.delete({
            where: { id },
        });
    }
}
