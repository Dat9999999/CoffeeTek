import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { OptionValuesService } from './option-values.service';
import { PaginationDto } from './dto/option-value.dto';

@Controller('option-values')
export class OptionValuesController {
    constructor(private readonly optionValuesService: OptionValuesService) { }

    @Post()
    create(
        @Body('name') name: string,
        @Body('sort_index') sort_index: number,
        @Body('option_group_id') option_group_id: number,
    ) {
        return this.optionValuesService.create(name, sort_index, option_group_id);
    }

    @Get()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.optionValuesService.findAll(paginationDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.optionValuesService.findOne(+id);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body('name') name: string,
        @Body('sort_index') sort_index: number,
        @Body('option_group_id') option_group_id: number,
    ) {
        return this.optionValuesService.update(+id, name, sort_index, option_group_id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.optionValuesService.remove(+id);
    }
}
