import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

import { Prisma } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { GetAllProductsDto } from './dto/get-all-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ResponseGetAllDto } from 'src/common/dto/pagination.dto';
import { PosProductDetailResponse, PosProductSizeResponse, ProductDetailResponse } from './dto/response.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService,
              private redisService: RedisService) { }

  async toggleActiveStatus(id: number, isActive: boolean) {
    return await this.prisma.product.update({
      where: { id },
      data: { isActive },
    });
  }
  // helper generate cache key for product list
  private generateCacheKey(query: GetAllProductsDto, prefix: string = 'products'): string {
    const {
      page,
      size,
      search,
      orderBy,
      orderDirection,
      categoryId,
      isTopping,
    } = query;

    // Create a unique key based on all query parameters
    const keyParts = [
      prefix,
      `page:${page}`,
      `size:${size}`,
      search ? `search:${search.toLowerCase()}` : 'search:null',
      `orderBy:${orderBy}`,
      `orderDir:${orderDirection}`,
      categoryId ? `cat:${categoryId}` : 'cat:null',
      isTopping !== undefined ? `topping:${isTopping}` : 'topping:null',
    ];

    return keyParts.join(':');
  }
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

    const product = await this.prisma.product.create({
      data: {
        name,
        is_multi_size,
        product_detail,
        price,
        isTopping: dto.isTopping,
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
    });

    const new_product_detail = await this.findOne(product.id);
    return new_product_detail;
  }

  async findAll(
    query: GetAllProductsDto,
  ): Promise<ResponseGetAllDto<ProductDetailResponse>> {

    const cacheKey = this.generateCacheKey(query);
    const cachedData = await this.redisService.get<ResponseGetAllDto<ProductDetailResponse>>(cacheKey);
    if (cachedData) {
      Logger.log('Cache HIT for:', cacheKey);
      return cachedData;
    }
    Logger.log('Cache MISS for:', cacheKey);
    const {
      page,
      size,
      search,
      orderBy = 'id',
      orderDirection = 'asc',
      categoryId,
      isTopping,
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
        isTopping !== undefined ? { isTopping } : {},
      ],
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          images: true,
          sizes: {
            include: { size: true },
            orderBy: {
              size: {
                sort_index: 'asc' // Sắp xếp theo 'sort_index' của 'size'
              }
            }
          },
          toppings: {
            select: {
              topping: {
                include: {
                  images: true,
                },
              },
            },
          },
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
        isTopping: product.isTopping,
        price: product.price,
        category_id: product.category_id,
        category: product.category,
        images: product.images,
        sizes: product.sizes.map((s) => ({
          id: s.id,
          price: s.price,
          size: s.size,
        })),
        toppings: product.toppings.map((t) => {
          return {
            id: t.topping.id,
            name: t.topping.name,
            price: t.topping.price ?? 0,
            image_name: t.topping.images[0]?.image_name || null,
            sort_index: t.topping.images[0]?.sort_index || 0,
          };
        }),
        optionGroups: Array.from(optionGroupsMap.values()),
      };
    });
    const result = {
      data,
      meta: {
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
      },
    };

    // 🔹 Kết quả trả về
    // ✅ Step 4: Store in cache (TTL: 1 hour = 3600 seconds)
    await this.redisService.set(cacheKey, result, 3600);

    // 🔹 Kết quả trả về

    return result;
  }

  async findAllPos(
    query: GetAllProductsDto,
    // ✅ 1. Thay đổi kiểu trả về sang Response Type mới
  ): Promise<ResponseGetAllDto<PosProductDetailResponse>> {
    const cacheKey = this.generateCacheKey(query, 'products:pos');

    const cachedData = await this.redisService.get<ResponseGetAllDto<PosProductDetailResponse>>(cacheKey);
    if (cachedData) {
      Logger.log('Cache HIT for:', cacheKey);
      return cachedData;
    }
    Logger.log('Cache MISS for pos:', cacheKey);
    const {
      page,
      size,
      search,
      orderBy = 'id',
      orderDirection = 'asc',
      categoryId,
      isTopping,
    } = query;

    let categoryIds: number[] | undefined;

    //  Nếu có filter theo categoryId, lấy tất cả category con (nếu có)
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
        isTopping !== undefined ? { isTopping } : {},
      ],
    };

    // ✅ 2. Lấy ngày giờ hiện tại để lọc các khuyến mãi hợp lệ
    const now = new Date();
    const promotionFilter = {
      Promotion: {
        is_active: true,
        start_date: { lte: now }, // Bắt đầu <= hiện tại
        end_date: { gte: now }, // Kết thúc >= hiện tại
      },
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          images: true,
          // ✅ 3. Include KM cho sản phẩm 1 size (hoặc base product)
          ProductPromotion: {
            where: {
              productSizeId: null, // Lọc KM cho base product (không phải size)
              ...promotionFilter,
            },
            select: { new_price: true },
          },
          sizes: {
            orderBy: { size: { sort_index: 'asc' } }, // Sắp xếp size
            include: {
              size: true,
              // ✅ 4. Include KM cho từng size (sản phẩm nhiều size)
              ProductPromotion: {
                where: promotionFilter, // Tự động lọc theo productSizeId
                select: { new_price: true },
              },
            },
          },
          // ✅ 5. Topping: Giữ nguyên, không lấy KM
          toppings: {
            select: {
              topping: {
                include: {
                  images: true,
                },
              },
            },
          },
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

    // 🔹 Map dữ liệu sang PosProductDetailResponse
    // ✅ 6. Thay đổi kiểu của data sang Response Type mới
    const data: PosProductDetailResponse[] = products.map((product) => {
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

      // ✅ 7. Xử lý giá cho sản phẩm 1 size
      const mainOldPrice = product.price ?? null;
      const mainPromotion = product.ProductPromotion?.[0]; // Lấy KM đã lọc
      const mainPrice = mainPromotion?.new_price ?? mainOldPrice;

      // ✅ 8. Xử lý giá cho sản phẩm nhiều size
      const mappedSizes: PosProductSizeResponse[] = product.sizes.map((s) => {
        const sizeOldPrice = s.price;
        const sizePromotion = s.ProductPromotion?.[0]; // Lấy KM đã lọc cho size này
        const sizePrice = sizePromotion?.new_price ?? sizeOldPrice;

        return {
          id: s.id,
          price: sizePrice, // Giá mới (hoặc giá cũ)
          old_price: sizePrice !== sizeOldPrice ? sizeOldPrice : undefined, // Chỉ gán nếu có KM
          size: s.size,
        };
      });

      // ✅ 9. Xử lý toppings (trả về giá gốc)
      const mappedToppings = product.toppings.map((t) => {
        return {
          id: t.topping.id,
          name: t.topping.name,
          price: t.topping.price ?? 0, // Luôn là giá gốc
          image_name: t.topping.images[0]?.image_name || null,
          sort_index: t.topping.images[0]?.sort_index || 0,
        };
      });

      return {
        id: product.id,
        name: product.name,
        is_multi_size: product.is_multi_size,
        product_detail: product.product_detail,
        isTopping: product.isTopping,
        price: mainPrice, // Giá mới (hoặc giá cũ)
        old_price: mainPrice !== mainOldPrice ? mainOldPrice : undefined, // Chỉ gán nếu có KM
        category_id: product.category_id,
        category: product.category,
        images: product.images,
        sizes: mappedSizes,
        toppings: mappedToppings,
        optionGroups: Array.from(optionGroupsMap.values()),
      };
    });
    const result = {
      data,
      meta: {
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
      },
    };

    // 🔹 Kết quả trả về
    // ✅ Step 4: Store in cache (TTL: 1 hour = 3600 seconds)
    await this.redisService.set(cacheKey, result, 3600);
    return result;
  }

  async findOne(id: number): Promise<ProductDetailResponse> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        sizes: {
          include: { size: true },
          orderBy: {
            size: {
              sort_index: 'asc' // Sắp xếp theo 'sort_index' của 'size'
            }
          }
        },
        toppings: {
          select: {
            topping: {
              include: { images: true },
            },
          },
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
      isTopping: product.isTopping,
      product_detail: product.product_detail,
      price: product.price,
      category_id: product.category_id,
      category: product.category,
      images: product.images,
      sizes: product.sizes.map((s) => ({
        id: s.id,
        price: s.price,
        size: s.size,
      })),
      toppings: product.toppings.map((t) => {
        return {
          id: t.topping.id,
          name: t.topping.name,
          price: t.topping.price ?? 0,
          image_name: t.topping.images[0]?.image_name || null,
          sort_index: t.topping.images[0]?.sort_index || 0,
        };
      }),
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
        isTopping: dto.isTopping,
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
