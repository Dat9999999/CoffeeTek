import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { GetAllCategoriesDto } from './dto/categories.dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    create(name: string, sort_index: number, is_parent_category: boolean, parent_category_id?: number) {
        return this.prisma.category.create({
            data: {
                name,
                sort_index,
                is_parent_category,
                parent_category_id,
            },
        });
    }

    async findAll(query: GetAllCategoriesDto) {
        const { page, size, search, orderBy = 'id', orderDirection = 'asc' } = query;

        const where: Prisma.CategoryWhereInput = search
            ? {
                name: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                },
            }
            : {};

        const [data, total] = await Promise.all([
            this.prisma.category.findMany({
                where,
                orderBy: { [orderBy]: orderDirection },
                skip: (page - 1) * size,
                take: size,
            }),
            this.prisma.category.count({ where }),
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
        return this.prisma.category.findUnique({
            where: { id },
            include: { subcategories: true, parent_category: true },
        });
    }

    update(id: number, name: string, sort_index: number, is_parent_category: boolean, parent_category_id?: number) {
        return this.prisma.category.update({
            where: { id },
            data: { name, sort_index, is_parent_category, parent_category_id },
        });
    }

    remove(id: number) {
        return this.prisma.category.delete({
            where: { id },
        });
    }
}
