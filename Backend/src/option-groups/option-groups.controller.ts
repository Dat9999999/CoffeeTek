import { Controller, Get, Post, Body, Param, Delete, Put, Query, ParseIntPipe } from '@nestjs/common';
import { OptionGroupsService } from './option-groups.service';
import { CreateOptionGroupDto, UpdateOptionGroupDto, PaginationDto } from './dto/option-group.dto';

@Controller('option-groups')
export class OptionGroupsController {
    constructor(private readonly optionGroupsService: OptionGroupsService) { }

    @Post()
    create(@Body() createOptionGroupDto: CreateOptionGroupDto) {
        return this.optionGroupsService.create(createOptionGroupDto);
    }

    @Get()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.optionGroupsService.findAll(paginationDto);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.optionGroupsService.findOne(id);
    }

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateOptionGroupDto: UpdateOptionGroupDto) {
        return this.optionGroupsService.update(id, updateOptionGroupDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.optionGroupsService.remove(id);
    }

    @Delete()
    removeMany(@Body() body: { ids: number[] }) {
        return this.optionGroupsService.removeMany(body.ids);
    }
}
