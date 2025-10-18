import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InventoryService {
    constructor(private readonly prisma: PrismaService) {
    }

    async adjustInventoryByOrderDetail(productId: number, productQuantity: number, orderId: number, sizeId?: number) {
        Logger.log(`Adjusting inventory for order with product ID: ${productId}`);
        const recipe = await this.prisma.recipe.findUnique({
            where: { product_id: productId },
            include: { MaterialRecipe: true, Product: true }
        });
        this.prisma.$transaction(async (tx) => {
            for (const materialRecipe of recipe?.MaterialRecipe || []) {
                const material = await this.prisma.material.findUnique({
                    where: {
                        id: materialRecipe.materialId
                    }
                })
                if (!material) throw new NotFoundException('Material not found in inventory ');
                if (materialRecipe.consume > material.remain) throw new InternalServerErrorException(`Not enough material id ${material?.name} to produce product id ${productId}`);


                // add consume logic for multisize productß
                var additionalConsume = 0;
                // if product has multisize 
                if (recipe?.Product?.is_multi_size) {
                    const consumeSize = await this.prisma.consumeSize.findFirst({
                        where: {
                            materialRecipeId: materialRecipe.id,
                            productSizeId: sizeId

                        }
                    })
                    additionalConsume = consumeSize ? consumeSize.additionalConsume : 0;
                    Logger.log(`Product id ${productId} with size id ${sizeId} has additional consume ${additionalConsume} for material id ${material?.name}`);
                }

                //new rermain with out considerate about size of product
                const newRemain = material.remain - (materialRecipe.consume * productQuantity);
                Logger.log(`Material id ${material?.name} current remain: ${material.remain}, consume: ${(materialRecipe.consume + additionalConsume) * productQuantity} for product id ${productId}`);

                // store consume value in inventory adjustment table
                await tx.inventoryAdjustment.create({
                    data: {
                        materialId: material.id,
                        consume: (materialRecipe.consume + additionalConsume) * productQuantity,
                        relatedOrderId: orderId,
                        reason: `Consumed for producing product id ${productId}`
                    }
                })

            }
        });
        return recipe
    }
}
