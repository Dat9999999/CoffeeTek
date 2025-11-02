import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOptionGroupDto, UpdateOptionGroupDto, PaginationDto } from './dto/option-group.dto';

@Injectable()
export class OptionGroupsService {
    constructor(private prisma: PrismaService) { }

    async create(createOptionGroupDto: CreateOptionGroupDto) {
        const lastGroup = await this.prisma.optionGroup.findFirst({
            orderBy: { id: 'desc' },
            select: { id: true },
        });

        return this.prisma.optionGroup.create({
            data: createOptionGroupDto,
        });
    }

    async findAll(paginationDto: PaginationDto) {
        const {
            page,
            size,
            orderBy = 'id',
            orderDirection = 'asc',
            search,
        } = paginationDto;

        const skip = (page - 1) * size;

        const where: any = {};

        if (search) {
            where.name = {
                contains: search,
                mode: 'insensitive',
            };
        }

        const [groups, total] = await Promise.all([
            this.prisma.optionGroup.findMany({
                skip,
                take: size,
                orderBy: { [orderBy]: orderDirection },
                where,
                include: { values: true }
            }),
            this.prisma.optionGroup.count({ where }),
        ]);

        return {
            data: groups,
            meta: {
                total,
                page,
                size,
                totalPages: Math.ceil(total / size),
            },
        };
    }

    async findOne(id: number) {
        const group = await this.prisma.optionGroup.findUnique({
            where: { id },
            include: { values: true },
        });

        if (!group) {
            throw new NotFoundException(`Option group with id ${id} not found`);
        }

        return group;
    }

    async update(id: number, updateOptionGroupDto: UpdateOptionGroupDto) {
        const group = await this.prisma.optionGroup.findUnique({ where: { id } });
        if (!group) {
            throw new NotFoundException(`Option group with id ${id} not found`);
        }

        return this.prisma.optionGroup.update({
            where: { id },
            data: updateOptionGroupDto,
        });
    }

    async remove(id: number) {
        const group = await this.prisma.optionGroup.findUnique({ where: { id } });
        if (!group) {
            throw new NotFoundException(`Option group with id ${id} not found`);
        }

        return this.prisma.optionGroup.delete({
            where: { id },
        });
    }

    async removeMany(ids: number[]) {
        const deleted = await this.prisma.optionGroup.deleteMany({
            where: {
                id: { in: ids },
            },
        });

        return {
            message: `Successfully deleted ${deleted.count} option groups`,
            count: deleted.count,
        };
    }
}
