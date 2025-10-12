import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from './dto/option-value.dto';

@Injectable()
export class OptionValuesService {
    constructor(private prisma: PrismaService) { }

    async create(name: string, option_group_id: number, sort_index?: number) {

        if (sort_index) {
            return this.prisma.optionValue.create({
                data: { name, sort_index, option_group_id },
            });
        }

        const maxSort = await this.prisma.optionValue.aggregate({
            where: { option_group_id },
            _max: { sort_index: true },
        });

        const nextSortIndex = (maxSort._max.sort_index ?? 0) + 1;

        if (sort_index) {
            return this.prisma.optionValue.create({
                data: { name, sort_index, option_group_id },
            });
        }

        return this.prisma.optionValue.create({
            data: { name, sort_index: nextSortIndex, option_group_id },
        });
    }

    async findAll(paginationDto: PaginationDto) {
        const { page, size, search, orderBy = 'id', orderDirection } = paginationDto;
        const skip = (page - 1) * size;

        const whereClause: any = search
            ? { name: { contains: search, mode: 'insensitive' } }
            : {};

        const [optionValues, total] = await Promise.all([
            this.prisma.optionValue.findMany({
                skip,
                take: +size,
                where: whereClause,
                include: { option_group: true },
                orderBy: { [orderBy]: orderDirection },
            }),
            this.prisma.optionValue.count({ where: whereClause }),
        ]);

        return {
            data: optionValues,
            meta: {
                total,
                page,
                size,
                totalPages: Math.ceil(total / size),
            }
        };
    }

    findOne(id: number) {
        return this.prisma.optionValue.findUnique({
            where: { id },
            include: { option_group: true },
        });
    }

    async update(id: number, name?: string, option_group_id?: number, sort_index?: number) {
        // Nếu chuyển nhóm -> sort_index của nhóm mới = max + 1
        let updateData: any = { name };

        if (sort_index) {
            updateData.sort_index = sort_index;
            updateData.option_group_id = option_group_id;
            return this.prisma.optionValue.update({
                where: { id },
                data: updateData,
            });
        }

        if (option_group_id) {
            const maxSort = await this.prisma.optionValue.aggregate({
                where: { option_group_id },
                _max: { sort_index: true },
            });

            updateData.option_group_id = option_group_id;
            updateData.sort_index = (maxSort._max.sort_index ?? 0) + 1;
        }

        return this.prisma.optionValue.update({
            where: { id },
            data: updateData,
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
