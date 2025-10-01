import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSizeDto, UpdateSizeDto, PaginationDto } from './dto/size.dto';

@Injectable()
export class SizesService {
    constructor(private prisma: PrismaService) { }

    async create(createSizeDto: CreateSizeDto) {
        const { name, sort_index } = createSizeDto;
        return this.prisma.size.create({
            data: { name, sort_index, increase_rate: 0.0 },
        });
    }

    async findAll(paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;

        const [sizes, total] = await Promise.all([
            this.prisma.size.findMany({
                skip,
                take: limit,
                orderBy: { sort_index: 'asc' },
            }),
            this.prisma.size.count(),
        ]);

        return {
            data: sizes,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: number) {
        const size = await this.prisma.size.findUnique({
            where: { id },
        });
        if (!size) {
            throw new NotFoundException(`Size with id ${id} not found`);
        }
        return size;
    }

    async update(id: number, updateSizeDto: UpdateSizeDto) {
        const size = await this.prisma.size.findUnique({ where: { id } });
        if (!size) {
            throw new NotFoundException(`Size with id ${id} not found`);
        }
        return this.prisma.size.update({
            where: { id },
            data: updateSizeDto,
        });
    }

    async remove(id: number) {
        const size = await this.prisma.size.findUnique({ where: { id } });
        if (!size) {
            throw new NotFoundException(`Size with id ${id} not found`);
        }
        return this.prisma.size.delete({
            where: { id },
        });
    }
}