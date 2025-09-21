import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { OptionGroupsService } from './option-groups.service';

@Controller('option-groups')
export class OptionGroupsController {
    constructor(private readonly optionGroupsService: OptionGroupsService) { }

    @Post()
    create(@Body('name') name: string) {
        return this.optionGroupsService.create(name);
    }

    @Get()
    findAll(
        @Query('page') page: string,
        @Query('limit') limit: string,
    ) {
        return this.optionGroupsService.findAll(+page || 1, +limit || 10);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.optionGroupsService.findOne(+id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body('name') name: string) {
        return this.optionGroupsService.update(+id, name);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.optionGroupsService.remove(+id);
    }
}
