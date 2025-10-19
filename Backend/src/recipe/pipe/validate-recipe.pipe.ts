import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";

export class ValidateRecipePipe implements PipeTransform<any> {
    transform(value: any, metadata: ArgumentMetadata) {
        if (!metadata || metadata.type !== 'body') {
            return value;
        }
        const materialIds = value.materials?.map((material: any) => material.materialId);
        if (materialIds) {
            const uniqueMaterialIds = new Set(materialIds);
            if (uniqueMaterialIds.size !== materialIds.length) {
                throw new BadRequestException('Duplicate materialIds found in materials array');
            }
        }
        return value;
    }
}