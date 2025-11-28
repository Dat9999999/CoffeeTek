import { Type } from 'class-transformer';

export class UpdateMaterialRemainDto  {
    @Type(() => Date)
    date: Date
}
