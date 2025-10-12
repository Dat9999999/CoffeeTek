import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { SizesService } from './sizes.service';
import { CreateSizeDto, UpdateSizeDto, PaginationDto } from './dto/size.dto';
import { ParseIntPipe } from '@nestjs/common';

@Controller('sizes')
export class SizesController {
    constructor(private readonly sizesService: SizesService) { }

    @Post()
    create(@Body() createSizeDto: CreateSizeDto) {
        return this.sizesService.create(createSizeDto);
    }

    @Get()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.sizesService.findAll(paginationDto);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.sizesService.findOne(id);
    }

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateSizeDto: UpdateSizeDto) {
        return this.sizesService.update(id, updateSizeDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.sizesService.remove(id);
    }

    @Delete()
    removeMany(@Body() body: { ids: number[] }) {
        return this.sizesService.removeMany(body.ids);
    }
}