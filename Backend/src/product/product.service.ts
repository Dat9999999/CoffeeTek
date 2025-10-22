import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { Prisma } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { GetAllProductsDto } from './dto/get-all-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ResponseGetAllDto } from 'src/common/dto/pagination.dto';
import { ProductDetailResponse } from './dto/response.dto';

@Injectable()
export class ProductsService {
  async toggleActiveStatus(id: number, isActive: boolean) {
    return await this.prisma.product.update({
      where: { id },
      data: { isActive },
    });
  }
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateProductDto) {
    const {
      name,
      is_multi_size,
      product_detail,
      price,
      sizeIds,
      optionValueIds,
      toppingIds,
      categoryId,
    } = dto;

    // Validate logic
    if (!is_multi_size && (price === undefined || price === null)) {
      throw new Error('Product must have a price when is_multi_size = false');
    }

    if (is_multi_size) {
      if (!sizeIds || sizeIds.length === 0) {
        throw new Error('Product must have sizes when is_multi_size = true');
      }
      if (price !== undefined && price !== null) {
        throw new Error('Product price must be null when using multi size');
      }
    }

    return this.prisma.product.create({
      data: {
        name,
        is_multi_size,
        product_detail,
        price,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        sizes: sizeIds
          ? {
            create: sizeIds.map((s) => ({
              size_id: s.id,
              price: s.price,
            })),
          }
          : undefined,
        optionValues: optionValueIds
          ? {
            create: optionValueIds.map((id) => ({ option_value_id: id })),
          }
          : undefined,
        toppings: toppingIds
          ? {
            create: toppingIds.map((id) => ({ topping_id: id })),
          }
          : undefined,
        images: dto.images
          ? {
            create: dto.images.map((img) => ({
              image_name: img.image_name,
              sort_index: img.sort_index,
            })),
          }
          : undefined,
      },
      include: {
        sizes: true,
        optionValues: true,
        toppings: true,
        images: true,
      },
    });
  }

  async findAll(
    query: GetAllProductsDto,
  ): Promise<ResponseGetAllDto<ProductDetailResponse>> {
    const {
      page,
      size,
      search,
      orderBy = 'id',
      orderDirection = 'asc',
      categoryId,
    } = query;

    let categoryIds: number[] | undefined;

    //  Nếu có filter theo categoryId, lấy tất cả category con (nếu có)
    if (categoryId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: categoryId },
        include: { subcategories: true },
      });

      if (parent) {
        // Gộp category cha + con
        categoryIds = [parent.id, ...parent.subcategories.map((c) => c.id)];
      }
    }

    const where: Prisma.ProductWhereInput = {
      AND: [
        search
          ? { name: { contains: search, mode: Prisma.QueryMode.insensitive } }
          : {},
        categoryId === -1 // nếu chọn "Chưa phân loại"
          ? { category_id: null }
          : categoryIds
            ? { category_id: { in: categoryIds } }
            : {},
      ],
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          images: true,
          sizes: { include: { size: true } },
          toppings: { select: { topping: true } },
          optionValues: {
            include: {
              option_value: {
                include: { option_group: true },
              },
            },
          },
        },
        orderBy: { [orderBy]: orderDirection },
        skip: (page - 1) * size,
        take: size,
      }),
      this.prisma.product.count({ where }),
    ]);

    // 🔹 Map dữ liệu sang ProductDetailResponse
    const data: ProductDetailResponse[] = products.map((product) => {
      const optionGroupsMap = new Map<number, any>();

      for (const pov of product.optionValues) {
        const group = pov.option_value.option_group;
        const value = pov.option_value;

        if (!optionGroupsMap.has(group.id)) {
          optionGroupsMap.set(group.id, {
            id: group.id,
            name: group.name,
            values: [],
          });
        }

        optionGroupsMap.get(group.id).values.push({
          id: value.id,
          name: value.name,
          sort_index: value.sort_index,
        });
      }

      return {
        id: product.id,
        name: product.name,
        is_multi_size: product.is_multi_size,
        product_detail: product.product_detail,
        price: product.price,
        category_id: product.category_id,
        category: product.category,
        images: product.images,
        sizes: product.sizes.map((s) => ({
          price: s.price,
          size: s.size,
        })),
        toppings: product.toppings.map((t) => t.topping),
        optionGroups: Array.from(optionGroupsMap.values()),
      };
    });

    // 🔹 Kết quả trả về

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

  async findOne(id: number): Promise<ProductDetailResponse> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        sizes: {
          include: { size: true },
        },
        toppings: {
          select: { topping: true },
        },
        optionValues: {
          include: {
            option_value: {
              include: { option_group: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    const optionGroupsMap = new Map<number, any>();

    for (const pov of product.optionValues) {
      const group = pov.option_value.option_group;
      const value = pov.option_value;

      if (!optionGroupsMap.has(group.id)) {
        optionGroupsMap.set(group.id, {
          id: group.id,
          name: group.name,
          values: [],
        });
      }
      optionGroupsMap.get(group.id).values.push({
        id: value.id,
        name: value.name,
        sort_index: value.sort_index,
      });
    }

    return {
      id: product.id,
      name: product.name,
      is_multi_size: product.is_multi_size,
      product_detail: product.product_detail,
      price: product.price,
      category_id: product.category_id,
      category: product.category,
      images: product.images,
      sizes: product.sizes.map((s) => ({
        price: s.price,
        size: s.size,
      })),
      toppings: product.toppings.map((t) => t.topping),
      optionGroups: Array.from(optionGroupsMap.values()),
    };
  }

  async update(id: number, dto: UpdateProductDto) {
    const {
      name,
      is_multi_size,
      product_detail,
      price,
      sizeIds,
      optionValueIds,
      toppingIds,
      categoryId,
    } = dto;

    const existing = await this.prisma.product.findUnique({
      where: { id },
      include: { sizes: true, optionValues: true, toppings: true },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const finalIsMultiSize = is_multi_size ?? existing.is_multi_size;

    // Validate logic
    if (!finalIsMultiSize && (price === undefined || price === null)) {
      throw new Error('Product must have a price when is_multi_size = false');
    }

    if (finalIsMultiSize) {
      if (!sizeIds || sizeIds.length === 0) {
        throw new Error('Product must have sizes when is_multi_size = true');
      }
      if (price !== undefined && price !== null) {
        throw new Error('Product price must be null when using multi size');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name,
        is_multi_size,
        product_detail,
        price,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        // Cập nhật quan hệ (topping, option, size)
        sizes: sizeIds
          ? {
            deleteMany: {}, // xoá toàn bộ cũ
            create: sizeIds.map((s) => ({
              size_id: s.id,
              price: s.price,
            })),
          }
          : undefined,
        optionValues: optionValueIds
          ? {
            deleteMany: {},
            create: optionValueIds.map((id) => ({ option_value_id: id })),
          }
          : undefined,
        toppings: toppingIds
          ? {
            deleteMany: {},
            create: toppingIds.map((id) => ({ topping_id: id })),
          }
          : undefined,
        images: dto.images
          ? {
            deleteMany: {},
            create: dto.images.map((img) => ({
              image_name: img.image_name,
              sort_index: img.sort_index,
            })),
          }
          : undefined,
      },
      include: { sizes: true, optionValues: true, toppings: true },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    // delete related records
    await this.prisma.productSize.deleteMany({ where: { product_id: id } });
    await this.prisma.productOptionValue.deleteMany({
      where: { product_id: id },
    });
    await this.prisma.productTopping.deleteMany({ where: { product_id: id } });
    await this.prisma.productImage.deleteMany({ where: { product_id: id } });

    return this.prisma.product.delete({ where: { id } });
  }

  async removeMany(ids: number[]) {
    if (!ids || ids.length === 0) {
      throw new Error('No product IDs provided for deletion');
    }

    // Kiểm tra sản phẩm tồn tại
    const existingProducts = await this.prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });

    if (existingProducts.length === 0) {
      throw new NotFoundException('No valid product IDs found');
    }

    const existingIds = existingProducts.map((p) => p.id);

    // Dùng transaction để đảm bảo tính toàn vẹn dữ liệu
    await this.prisma.$transaction(async (tx) => {
      await tx.productSize.deleteMany({
        where: { product_id: { in: existingIds } },
      });

      await tx.productOptionValue.deleteMany({
        where: { product_id: { in: existingIds } },
      });

      await tx.productTopping.deleteMany({
        where: { product_id: { in: existingIds } },
      });

      await tx.productImage.deleteMany({
        where: { product_id: { in: existingIds } },
      });

      await tx.product.deleteMany({
        where: { id: { in: existingIds } },
      });
    });

    return {
      message: `Deleted ${existingIds.length} product(s) successfully.`,
      deletedIds: existingIds,
    };
  }
}
