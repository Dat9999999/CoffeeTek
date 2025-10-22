import { Type } from 'class-transformer';
import { IsEnum, IsOptional, Min } from 'class-validator';
import { OrderDirection } from 'src/common/enums/order.enum';

export class GetAllProductsDto {
  @Type(() => Number)
  @Min(1)
  page = 1;

  @Min(1)
  @Type(() => Number)
  size = 10;

  @IsOptional()
  search?: string;

  @Type(() => Number)
  @IsOptional()
  categoryId?: number;

  @IsOptional()
  orderBy?: string = 'name';

  @IsEnum(OrderDirection)
  @IsOptional()
  orderDirection?: OrderDirection = OrderDirection.ASC;
}
