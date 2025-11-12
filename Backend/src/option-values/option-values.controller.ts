import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { OptionValuesService } from './option-values.service';
import { PaginationDto, CreateOptionValueDto, UpdateOptionValueDto } from './dto/option-value.dto';

@Controller('option-values')
export class OptionValuesController {
    constructor(private readonly optionValuesService: OptionValuesService) { }

    @Post()
    create(@Body() createDto: CreateOptionValueDto) {
        return this.optionValuesService.create(createDto.name, createDto.option_group_id, createDto.sort_index);
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
    update(@Param('id') id: string, @Body() updateDto: UpdateOptionValueDto) {
        return this.optionValuesService.update(+id, updateDto.name, updateDto.option_group_id, updateDto.sort_index);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.optionValuesService.remove(+id);
    }
}
