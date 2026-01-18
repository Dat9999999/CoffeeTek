import { IsDate, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAllContractingDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  materialId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  employeeId?: number;
}

