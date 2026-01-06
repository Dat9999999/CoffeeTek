import { IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CalculateRemainingDto {
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  date: Date;
}

