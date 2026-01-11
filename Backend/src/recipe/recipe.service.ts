import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RecipeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRecipeDto: CreateRecipeDto) {
    return await this.prisma.$transaction(async (tx) => {
      let recipe = await tx.recipe.findFirst({
        where: {
          product_id: createRecipeDto.productId,
        },
      });
      if (!recipe) {
        recipe = await tx.recipe.create({
          data: {
            product_id: createRecipeDto.productId,
          },
        });
      }

      for (const material of createRecipeDto.materials) {
        const m = await tx.material.findUnique({
          where: { id: material.materialId },
        });

        if (!m)
          throw new BadRequestException(
            `Material with ID ${material.materialId} does not exist`,
          );
        await tx.materialRecipe.create({
          data: {
            recipeId: recipe.id,
            materialId: material.materialId,
            consume: material.consume,
            sizeId: createRecipeDto.sizeId,
          },
        });
      }
      return recipe;
    });
  }

  async findAll() {
    return await this.prisma.recipe.findMany({
      include: {
        Product: true,
        MaterialRecipe: {
          include: {
            Material: {
              include: {
                Unit: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        Product: true,
        MaterialRecipe: {
          include: {
            Material: {
              include: {
                Unit: true,
              },
            },
          },
        },
      },
    });
  }

  async findOneByProductId(productId: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { product_id: productId },
      include: {
        Product: true,
        MaterialRecipe: {
          include: {
            Material: { include: { Unit: true } },
            Size: true,
          },
        },
      },
    });

    if (!recipe) {
      throw new NotFoundException(
        `Recipe not found for product ID ${productId}`,
      );
    }

    return recipe;
  }

  async update(id: number, updateRecipeDto: UpdateRecipeDto) {
    const recipe = await this.prisma.recipe.findFirst({
      where: { id },
    });

    if (!recipe) {
      throw new BadRequestException(`Recipe with ID ${id} does not exist`);
    }
    // delete old data and insert new data
    await this.prisma.materialRecipe.deleteMany({
      where: { recipeId: id, sizeId: updateRecipeDto.sizeId },
    });
    for (const material of updateRecipeDto.materials || []) {
      await this.prisma.materialRecipe.create({
        data: {
          recipeId: id,
          materialId: material.materialId,
          consume: material.consume,
          sizeId: updateRecipeDto.sizeId ?? null,
        },
      });
    }
    return recipe;
  }

  async remove(id: number) {
    return await this.prisma.recipe.delete({
      where: { id },
    });
  }

  /**
   * Calculate the cost of a product based on its recipe and material prices
   * Uses average cost method: calculates average price per unit from all material importations
   * 
   * @param productId - The product ID
   * @param sizeId - Optional size ID for size-specific recipes
   * @returns The calculated cost of the product
   */
  async calculateProductCost(productId: number, sizeId?: number): Promise<number> {
    // 1. Get recipe for the product
    const recipe = await this.prisma.recipe.findUnique({
      where: { product_id: productId },
      include: {
        MaterialRecipe: {
          where: sizeId
            ? { OR: [{ sizeId: null }, { sizeId }] } // Size-specific or default
            : { sizeId: null },
          include: {
            Material: {
              include: {
                MaterialImportation: {
                  orderBy: { importDate: 'desc' },
                },
                Unit: true,
              },
            },
            Size: true,
          },
        },
      },
    });

    if (!recipe || !recipe.MaterialRecipe.length) {
      return 0; // No recipe = no cost
    }

    let totalCost = 0;

    // 2. For each material in recipe, calculate average cost
    for (const materialRecipe of recipe.MaterialRecipe) {
      const material = materialRecipe.Material;
      const consumeAmount = materialRecipe.consume;

      // Calculate average price per unit from importations
      const importations = material.MaterialImportation;
      if (importations.length === 0) {
        continue; // Skip if no import price data
      }

      // Average cost method: total value / total quantity
      const totalValue = importations.reduce(
        (sum, imp) => sum + (imp.pricePerUnit * imp.importQuantity),
        0,
      );
      const totalQuantity = importations.reduce(
        (sum, imp) => sum + imp.importQuantity,
        0,
      );
      const avgPricePerUnit =
        totalQuantity > 0 ? totalValue / totalQuantity : 0;

      // Cost for this material = consume amount × average price
      totalCost += consumeAmount * avgPricePerUnit;
    }

    return Math.round(totalCost * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate product cost with detailed breakdown
   * Returns cost along with material-wise breakdown
   */
  async calculateProductCostWithBreakdown(
    productId: number,
    sizeId?: number,
  ): Promise<{
    totalCost: number;
    materialCosts: Array<{
      materialId: number;
      materialName: string;
      consume: number;
      unit: string;
      avgPricePerUnit: number;
      cost: number;
    }>;
  }> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { product_id: productId },
      include: {
        MaterialRecipe: {
          where: sizeId
            ? { OR: [{ sizeId: null }, { sizeId }] }
            : { sizeId: null },
          include: {
            Material: {
              include: {
                MaterialImportation: {
                  orderBy: { importDate: 'desc' },
                },
                Unit: true,
              },
            },
            Size: true,
          },
        },
      },
    });

    if (!recipe || !recipe.MaterialRecipe.length) {
      return { totalCost: 0, materialCosts: [] };
    }

    const materialCosts: Array<{
      materialId: number;
      materialName: string;
      consume: number;
      unit: string;
      avgPricePerUnit: number;
      cost: number;
    }> = [];
    let totalCost = 0;

    for (const materialRecipe of recipe.MaterialRecipe) {
      const material = materialRecipe.Material;
      const consumeAmount = materialRecipe.consume;

      const importations = material.MaterialImportation;
      if (importations.length === 0) {
        continue;
      }

      const totalValue = importations.reduce(
        (sum, imp) => sum + (imp.pricePerUnit * imp.importQuantity),
        0,
      );
      const totalQuantity = importations.reduce(
        (sum, imp) => sum + imp.importQuantity,
        0,
      );
      const avgPricePerUnit =
        totalQuantity > 0 ? totalValue / totalQuantity : 0;
      const cost = consumeAmount * avgPricePerUnit;

      materialCosts.push({
        materialId: material.id,
        materialName: material.name,
        consume: consumeAmount,
        unit: material.Unit.symbol,
        avgPricePerUnit: Math.round(avgPricePerUnit * 100) / 100,
        cost: Math.round(cost * 100) / 100,
      });

      totalCost += cost;
    }

    return {
      totalCost: Math.round(totalCost * 100) / 100,
      materialCosts,
    };
  }
}
