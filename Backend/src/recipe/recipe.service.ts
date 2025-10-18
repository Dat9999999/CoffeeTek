import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RecipeService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createRecipeDto: CreateRecipeDto) {

    return await this.prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.create({
        data: {
          product_id: createRecipeDto.productId,
        }
      });
      for (const material of createRecipeDto.materials) {

        const m = await tx.material.findUnique({
          where: { id: material.materialId }
        });

        if (!m) throw new BadRequestException(
          `Material with ID ${material.materialId} does not exist`
        );
        await tx.materialRecipe.create({
          data: {
            recipeId: recipe.id,
            materialId: material.materialId,
            consume: material.consume
          }
        })
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
                Unit: true
              }
            },

          }
        }
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} recipe`;
  }

  update(id: number, updateRecipeDto: UpdateRecipeDto) {
    return `This action updates a #${id} recipe`;
  }

  async remove(id: number) {
    return await this.prisma.recipe.delete({
      where: { id }
    });
  }
}
