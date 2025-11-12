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
                if(materialRecipe.sizeId == sizeId){
                    const material = await this.prisma.material.findUnique({
                        where: {
                            id: materialRecipe.materialId
                        }
                    })
                    if (!material) throw new NotFoundException('Material not found in inventory ');
    
                    //new rermain with out considerate about size of product
    
                    // store consume value in inventory adjustment table
                    await tx.inventoryAdjustment.create({
                        data: {
                            materialId: material.id,
                            consume: (materialRecipe.consume) * productQuantity,
                            relatedOrderId: orderId,
                        }
                    })
                }

            }
        });
        return recipe
    }
}
