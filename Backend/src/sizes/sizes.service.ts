import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSizeDto, UpdateSizeDto, PaginationDto } from './dto/size.dto';

@Injectable()
export class SizesService {
    constructor(private prisma: PrismaService) { }

    async create(createSizeDto: CreateSizeDto) {
        const lastTopping = await this.prisma.size.findFirst({
            orderBy: { sort_index: 'desc' },
            select: { sort_index: true },
        });

        const nextSortIndex = lastTopping ? lastTopping.sort_index + 1 : 1;
        return this.prisma.size.create({
            data: { ...createSizeDto, sort_index: nextSortIndex },
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

        const [sizes, total] = await Promise.all([
            this.prisma.size.findMany({
                skip,
                take: size,
                orderBy: { [orderBy]: orderDirection },
                where,
            }),
            this.prisma.size.count({ where }),
        ]);

        return {
            data: sizes,
            meta: {
                total,
                page,
                size,
                totalPages: Math.ceil(total / size),
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

    async removeMany(ids: number[]) {


        const deleted = await this.prisma.size.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

        return {
            message: `Successfully deleted ${deleted.count} sizes`,
            count: deleted.count,
        };
    }


}