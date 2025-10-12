import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';
import { GetAllToppingsDto } from './dto/get-all-toppings.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ToppingsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateToppingDto) {
        const lastTopping = await this.prisma.topping.findFirst({
            orderBy: { sort_index: 'desc' },
            select: { sort_index: true },
        });

        const nextSortIndex = lastTopping ? lastTopping.sort_index + 1 : 1;

        return this.prisma.topping.create({
            data: {
                ...dto,
                sort_index: nextSortIndex,
            },
        });
    }


    async findAll(query: GetAllToppingsDto) {
        const { page, size, search, orderBy = 'id', orderDirection = 'asc' } = query;

        const where: Prisma.ToppingWhereInput = search
            ? {
                name: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                },
            }
            : {};

        const [data, total] = await Promise.all([
            this.prisma.topping.findMany({
                where,
                orderBy: { [orderBy]: orderDirection },
                skip: (page - 1) * size,
                take: size,
            }),
            this.prisma.topping.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                size,
                totalPages: Math.ceil(total / size),
            },
        };
    }

    findOne(id: number) {
        return this.prisma.topping.findUnique({ where: { id } });
    }

    update(id: number, dto: UpdateToppingDto) {
        return this.prisma.topping.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: number) {
        await this.prisma.productTopping.deleteMany({
            where: { topping_id: id },
        });

        return this.prisma.topping.delete({
            where: { id },
        });
    }

    async removeMany(ids: number[]) {
        await this.prisma.productTopping.deleteMany({
            where: {
                topping_id: {
                    in: ids,
                },
            },
        });

        const deleted = await this.prisma.topping.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

        return {
            message: `Successfully deleted ${deleted.count} toppings`,
            count: deleted.count,
        };
    }


}
