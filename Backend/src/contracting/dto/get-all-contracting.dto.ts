import { IsDate, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAllContractingDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  size?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;

  @IsOptional()
  @IsInt()
  materialId?: number;

  @IsOptional()
  @IsInt()
  employeeId?: number;
}

