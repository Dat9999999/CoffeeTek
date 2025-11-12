import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { GetAllCategoriesDto } from './dto/categories.dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async create(name: string, is_parent_category: boolean, parent_category_id?: number | null) {
        // Kiểm tra logic ràng buộc
        if (is_parent_category) {
            if (parent_category_id !== undefined && parent_category_id !== null) {
                throw new BadRequestException('Parent category must have null parent_category_id');
            }
        } else {
            if (parent_category_id === undefined || parent_category_id === null) {
                throw new BadRequestException('Subcategory must have a valid parent_category_id');
            }
            const parent = await this.prisma.category.findUnique({
                where: { id: parent_category_id },
            });
            if (!parent) {
                throw new BadRequestException('Parent category not found');
            }
            if (!parent.is_parent_category) {
                throw new BadRequestException('Parent category must be a parent category');
            }
        }

        const lastCategory = await this.prisma.category.findFirst({
            orderBy: { sort_index: 'desc' },
            select: { sort_index: true },
        });
        const nextSortIndex = lastCategory ? lastCategory.sort_index + 1 : 1;

        return this.prisma.category.create({
            data: {
                name,
                sort_index: nextSortIndex,
                is_parent_category,
                parent_category_id,
            },
        });
    }

    async findAll(query: GetAllCategoriesDto) {
        const { page, size, search, orderBy = 'id', orderDirection = 'asc', isParentCategory } = query;
        const where: Prisma.CategoryWhereInput = {};

        console.log(">>> isParentCategory: ", isParentCategory)

        if (search) {
            where.name = {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
            };
        }

        if (isParentCategory !== undefined) {
            where.is_parent_category = isParentCategory;
        }


        const [data, total] = await Promise.all([
            this.prisma.category.findMany({
                where,
                orderBy: { [orderBy]: orderDirection },
                skip: (page - 1) * size,
                take: size,
                include: {
                    parent_category: true,
                    subcategories: true
                }
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

    async update(id: number, name: string, is_parent_category: boolean, parent_category_id?: number | null) {
        const existingCategory = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!existingCategory) {
            throw new BadRequestException('Category not found');
        }

        if (is_parent_category) {
            if (parent_category_id !== undefined && parent_category_id !== null) {
                throw new BadRequestException('Parent category must have null parent_category_id');
            }
        } else {
            if (parent_category_id === undefined || parent_category_id === null) {
                throw new BadRequestException('Subcategory must have a valid parent_category_id');
            }
            const parent = await this.prisma.category.findUnique({
                where: { id: parent_category_id },
            });
            if (!parent) {
                throw new BadRequestException('Parent category not found');
            }
            if (!parent.is_parent_category) {
                throw new BadRequestException('Parent category must be a parent category');
            }
            if (parent_category_id === id) {
                throw new BadRequestException('Category cannot be its own parent');
            }
        }

        return this.prisma.category.update({
            where: { id },
            data: { name, is_parent_category, parent_category_id },
        });
    }

    async remove(id: number) {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            throw new BadRequestException('Category not found');
        }

        // Xóa tất cả subcategories 
        await this.prisma.category.deleteMany({
            where: { parent_category_id: id },
        });

        // Xóa category chính
        return this.prisma.category.delete({
            where: { id },
        });
    }

    async removeMany(ids: number[]) {

        // Xóa tất cả subcategories
        await this.prisma.category.deleteMany({
            where: {
                parent_category_id: {
                    in: ids,
                },
            },
        });

        // Xóa các category chính
        const deleted = await this.prisma.category.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

        return {
            message: `Successfully deleted ${deleted.count} categories`,
            count: deleted.count,
        };
    }
}