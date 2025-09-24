import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from './dto/option-value.dto';

@Injectable()
export class OptionValuesService {
    constructor(private prisma: PrismaService) { }

    create(name: string, sort_index: number, option_group_id: number) {
        return this.prisma.optionValue.create({
            data: { name, sort_index, option_group_id },
        });
    }

    async findAll(paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;

        const [optionValues, total] = await Promise.all([
            this.prisma.optionValue.findMany({
                skip,
                take: +limit,
                include: { option_group: true },
                orderBy: { sort_index: 'asc' },
            }),
            this.prisma.optionValue.count(),
        ]);

        return {
            data: optionValues,

            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    findOne(id: number) {
        return this.prisma.optionValue.findUnique({
            where: { id },
            include: { option_group: true },
        });
    }

    update(id: number, name: string, sort_index: number, option_group_id: number) {
        return this.prisma.optionValue.update({
            where: { id },
            data: { name, sort_index, option_group_id },
        });
    }

    async remove(id: number) {
        await this.prisma.productOptionValue.deleteMany({
            where: { option_value_id: id },
        });

        return this.prisma.optionValue.delete({
            where: { id },
        });
    }

}
