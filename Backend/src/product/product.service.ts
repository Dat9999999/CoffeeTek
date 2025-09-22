import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { Prisma } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { GetAllProductsDto } from './dto/get-all-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateProductDto) {
    const { name, is_multi_size, product_detail, price, sizeIds, optionValueIds, toppingIds } = dto;

    // Validate logic
    if (!is_multi_size && (price === undefined || price === null)) {
      throw new Error("Product must have a price when is_multi_size = false");
    }

    if (is_multi_size) {
      if (!sizeIds || sizeIds.length === 0) {
        throw new Error("Product must have sizes when is_multi_size = true");
      }
      if (price !== undefined && price !== null) {
        throw new Error("Product price must be null when using multi size");
      }
    }

    return this.prisma.product.create({
      data: {
        name,
        is_multi_size,
        product_detail,
        price,
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
      include: { sizes: true, optionValues: true, toppings: true, images: true },
    });

  }


  async findAll(query: GetAllProductsDto) {
    const { page, size, search, orderBy = 'id', orderDirection = 'asc' } = query;

    const where: Prisma.ProductWhereInput = search
      ? { name: { contains: search, mode: Prisma.QueryMode.insensitive } }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { sizes: true, optionValues: true, toppings: true },
        orderBy: { [orderBy]: orderDirection },
        skip: (page - 1) * size,
        take: size,
      }),
      this.prisma.product.count({ where }),
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
    return this.prisma.product.findUnique({
      where: { id },
      include: { sizes: true, optionValues: true, toppings: true },
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    const { name, is_multi_size, product_detail, price, sizeIds, optionValueIds, toppingIds } = dto;


    const existing = await this.prisma.product.findUnique({
      where: { id },
      include: { sizes: true, optionValues: true, toppings: true },
    });

    if (!existing) {
      throw new Error("Product not found");
    }

    const finalIsMultiSize = is_multi_size ?? existing.is_multi_size;

    // Validate logic
    if (!finalIsMultiSize && (price === undefined || price === null)) {
      throw new Error("Product must have a price when is_multi_size = false");
    }

    if (finalIsMultiSize) {
      if (!sizeIds || sizeIds.length === 0) {
        throw new Error("Product must have sizes when is_multi_size = true");
      }
      if (price !== undefined && price !== null) {
        throw new Error("Product price must be null when using multi size");
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name,
        is_multi_size,
        product_detail,
        price,
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


  remove(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }
}
