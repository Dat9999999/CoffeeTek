import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContractingDto } from './dto/create-contracting.dto';
import { UpdateContractingDto } from './dto/update-contracting.dto';
import { GetAllContractingDto } from './dto/get-all-contracting.dto';
import { CalculateRemainingDto } from './dto/calculate-remaining.dto';
import { ResponseGetAllDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ContractingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a contracting record - staff takes materials for a selling day
   * Validates that there's enough material in inventory
   */
  async create(createContractingDto: CreateContractingDto, employeeId?: number) {
    const { date, materialId, quantity } = createContractingDto;
    
    // Normalize date to start of day
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // Check if material exists
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: { Unit: true },
    });

    if (!material) {
      throw new NotFoundException(`Material with ID ${materialId} not found`);
    }

    // Check if contracting record already exists for this date and material
    const existingContracting = await this.prisma.contracting.findFirst({
      where: {
        materialId,
        created_at: {
          gte: normalizedDate,
          lt: new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000), // Next day
        },
      },
    });

    if (existingContracting) {
      throw new BadRequestException(
        `Contracting record already exists for material ${material.name} on ${normalizedDate.toISOString().split('T')[0]}`,
      );
    }

    // Get available inventory (last remain + imports)
    const availableQuantity = await this.getAvailableQuantity(materialId, normalizedDate);

    if (quantity > availableQuantity) {
      throw new BadRequestException(
        `Insufficient inventory. Available: ${availableQuantity} ${material.Unit?.symbol || ''}, Requested: ${quantity}`,
      );
    }

    // Create contracting record
    return await this.prisma.contracting.create({
      data: {
        materialId,
        quantity,
        empoloyeeId: employeeId || createContractingDto.employeeId || null,
        created_at: normalizedDate,
      },
      include: {
        Material: {
          include: { Unit: true },
        },
        User: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get all contracting records with pagination and filters
   */
  async findAll(query: GetAllContractingDto): Promise<ResponseGetAllDto<any>> {
    const {
      page = 1,
      size = 10,
      date,
      materialId,
      employeeId,
    } = query;

    const skip = (page - 1) * size;

    // Build where clause
    const where: any = {};

    if (date) {
      const normalizedDate = new Date(date);
      normalizedDate.setUTCHours(0, 0, 0, 0);
      const nextDay = new Date(normalizedDate);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);

      where.created_at = {
        gte: normalizedDate,
        lt: nextDay,
      };
    }

    if (materialId) {
      where.materialId = materialId;
    }

    if (employeeId) {
      where.empoloyeeId = employeeId;
    }

    const [data, total] = await Promise.all([
      this.prisma.contracting.findMany({
        where,
        skip,
        take: size,
        include: {
          Material: {
            include: { Unit: true },
          },
          User: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.contracting.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  /**
   * Get a single contracting record by ID
   */
  async findOne(id: number) {
    const contracting = await this.prisma.contracting.findUnique({
      where: { id },
      include: {
        Material: {
          include: { Unit: true },
        },
        User: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    if (!contracting) {
      throw new NotFoundException(`Contracting record with ID ${id} not found`);
    }

    return contracting;
  }

  /**
   * Update a contracting record
   */
  async update(id: number, updateContractingDto: UpdateContractingDto) {
    const contracting = await this.prisma.contracting.findUnique({
      where: { id },
      include: {
        Material: {
          include: { Unit: true },
        },
      },
    });

    if (!contracting) {
      throw new NotFoundException(`Contracting record with ID ${id} not found`);
    }

    // If updating quantity, validate available inventory
    if (updateContractingDto.quantity !== undefined) {
      const normalizedDate = new Date(contracting.created_at);
      normalizedDate.setUTCHours(0, 0, 0, 0);
      
      const availableQuantity = await this.getAvailableQuantity(
        contracting.materialId,
        normalizedDate,
      );

      // Add back the current contracted quantity to available
      const totalAvailable = availableQuantity + contracting.quantity;

      if (updateContractingDto.quantity > totalAvailable) {
        throw new BadRequestException(
          `Insufficient inventory. Available: ${totalAvailable} ${contracting.Material.Unit?.symbol || ''}, Requested: ${updateContractingDto.quantity}`,
        );
      }
    }

    const updateData: any = {};
    if (updateContractingDto.quantity !== undefined) {
      updateData.quantity = updateContractingDto.quantity;
    }
    if (updateContractingDto.date) {
      const normalizedDate = new Date(updateContractingDto.date);
      normalizedDate.setUTCHours(0, 0, 0, 0);
      updateData.created_at = normalizedDate;
    }

    return await this.prisma.contracting.update({
      where: { id },
      data: updateData,
      include: {
        Material: {
          include: { Unit: true },
        },
        User: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Delete a contracting record
   */
  async remove(id: number) {
    const contracting = await this.prisma.contracting.findUnique({
      where: { id },
    });

    if (!contracting) {
      throw new NotFoundException(`Contracting record with ID ${id} not found`);
    }

    return await this.prisma.contracting.delete({
      where: { id },
    });
  }

  /**
   * Calculate actual material consumption from orders for a specific date
   */
  async calculateActualConsumption(date: Date): Promise<Map<number, number>> {
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);
    const nextDay = new Date(normalizedDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    // Get all completed orders for the date
    const orders = await this.prisma.order.findMany({
      where: {
        created_at: {
          gte: normalizedDate,
          lt: nextDay,
        },
        status: {
          in: ['paid', 'completed'],
        },
      },
      include: {
        order_details: {
          include: {
            product: {
              include: {
                Recipe: {
                  include: {
                    MaterialRecipe: {
                      include: {
                        Material: true,
                        Size: true,
                      },
                    },
                  },
                },
              },
            },
            size: true,
          },
        },
      },
    });

    // Map to store material consumption: materialId -> total consumed
    const consumptionMap = new Map<number, number>();

    for (const order of orders) {
      for (const orderDetail of order.order_details) {
        const product = orderDetail.product;
        const quantity = orderDetail.quantity;
        const sizeId = orderDetail.size?.id ?? null;

        if (!product.Recipe || product.Recipe.length === 0) {
          continue;
        }

        // Get material recipes for this product
        const recipe = product.Recipe[0]; // Assuming one recipe per product
        if (!recipe.MaterialRecipe || recipe.MaterialRecipe.length === 0) {
          continue;
        }

        // Calculate consumption for each material in the recipe
        for (const materialRecipe of recipe.MaterialRecipe) {
          // Check if this material recipe matches the size (or is default)
          if (
            materialRecipe.sizeId === null ||
            materialRecipe.sizeId === sizeId
          ) {
            const materialId = materialRecipe.materialId;
            const consumePerUnit = materialRecipe.consume;
            const totalConsume = consumePerUnit * quantity;

            const currentConsumption = consumptionMap.get(materialId) || 0;
            consumptionMap.set(materialId, currentConsumption + totalConsume);
          }
        }
      }
    }

    return consumptionMap;
  }

  /**
   * Calculate remaining materials at end of day and optionally record in materialRemain
   */
  async calculateRemaining(
    calculateRemainingDto: CalculateRemainingDto,
    autoRecord: boolean = false,
  ) {
    const { date } = calculateRemainingDto;
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // Get all contracting records for this date
    const contractings = await this.prisma.contracting.findMany({
      where: {
        created_at: {
          gte: normalizedDate,
          lt: new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        Material: {
          include: { Unit: true },
        },
      },
    });

    // Calculate actual consumption
    const consumptionMap = await this.calculateActualConsumption(normalizedDate);

    // Calculate remaining for each material
    const results: Array<{
      materialId: number;
      materialName: string;
      materialCode: string;
      unit: string;
      contractedQuantity: number;
      actualConsumed: number;
      remaining: number;
    }> = [];

    for (const contracting of contractings) {
      const materialId = contracting.materialId;
      const contractedQuantity = contracting.quantity;
      const actualConsumed = consumptionMap.get(materialId) || 0;
      const remaining = Math.max(0, contractedQuantity - actualConsumed);

      results.push({
        materialId,
        materialName: contracting.Material.name,
        materialCode: contracting.Material.code,
        unit: contracting.Material.Unit?.symbol || contracting.Material.Unit?.name || '',
        contractedQuantity,
        actualConsumed,
        remaining,
      });

      // Optionally record in materialRemain
      if (autoRecord) {
        await this.recordMaterialRemain(materialId, normalizedDate, remaining);
      }
    }

    return {
      date: normalizedDate.toISOString().split('T')[0],
      results,
    };
  }

  /**
   * Record remaining materials in materialRemain table
   */
  private async recordMaterialRemain(
    materialId: number,
    date: Date,
    remaining: number,
  ) {
    // Check if record already exists
    const existing = await this.prisma.materialRemain.findFirst({
      where: {
        materialId,
        date: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existing) {
      // Update existing record
      await this.prisma.materialRemain.update({
        where: { id: existing.id },
        data: { remain: remaining },
      });
    } else {
      // Create new record
      await this.prisma.materialRemain.create({
        data: {
          materialId,
          date,
          remain: remaining,
        },
      });
    }
  }

  /**
   * Get available quantity for a material on a specific date
   * This considers last remain + imports after last remain - already contracted
   */
  private async getAvailableQuantity(
    materialId: number,
    date: Date,
  ): Promise<number> {
    // Get last remain before this date
    const lastRemain = await this.prisma.materialRemain.findFirst({
      where: {
        materialId,
        date: {
          lt: date,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Get imports after the last remain date (or all imports if no last remain)
    const lastRemainDate = lastRemain?.date || new Date(0);
    const imports = await this.prisma.materialImportation.findMany({
      where: {
        materialId,
        importDate: {
          gte: lastRemainDate,
          lt: date,
        },
      },
    });

    const totalImported = imports.reduce(
      (sum, imp) => sum + imp.importQuantity,
      0,
    );

    // Get already contracted for this date
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);
    const nextDay = new Date(normalizedDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const alreadyContracting = await this.prisma.contracting.findMany({
      where: {
        materialId,
        created_at: {
          gte: normalizedDate,
          lt: nextDay,
        },
      },
    });

    const totalContracted = alreadyContracting.reduce(
      (sum, c) => sum + c.quantity,
      0,
    );

    const lastRemainValue = lastRemain?.remain || 0;
    const available = lastRemainValue + totalImported - totalContracted;

    return Math.max(0, available);
  }

  /**
   * Get contracting records for a specific date grouped by material
   */
  async getByDate(date: Date) {
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);
    const nextDay = new Date(normalizedDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const contractings = await this.prisma.contracting.findMany({
      where: {
        created_at: {
          gte: normalizedDate,
          lt: nextDay,
        },
      },
      include: {
        Material: {
          include: { Unit: true },
        },
        User: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
      orderBy: {
        Material: {
          name: 'asc',
        },
      },
    });

    return contractings;
  }
}

