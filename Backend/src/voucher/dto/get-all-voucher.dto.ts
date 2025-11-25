import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { GetAllDto } from 'src/common/dto/pagination.dto';

export class GetAllVoucherDto extends GetAllDto {


    @IsOptional()
    @IsString()
    groupName?: string;


    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    isActive?: boolean;
}