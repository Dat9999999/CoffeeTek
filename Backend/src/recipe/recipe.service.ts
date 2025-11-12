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
}
