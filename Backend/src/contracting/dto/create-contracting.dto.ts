import { IsDate, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContractingDto {
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  date: Date;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  materialId: number;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  quantity: number;

  @IsOptional()
  @IsInt()
  employeeId?: number;
}

