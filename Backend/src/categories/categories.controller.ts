import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { GetAllDto } from 'src/common/dto/pagination.dto';
import { GetAllCategoriesDto } from './dto/categories.dto';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    create(
        @Body('name') name: string,
        @Body('is_parent_category') is_parent_category: boolean,
        @Body('parent_category_id') parent_category_id?: number,
    ) {
        return this.categoriesService.create(name, is_parent_category, parent_category_id);
    }

    @Get()
    findAll(@Query() query: GetAllCategoriesDto) {
        return this.categoriesService.findAll(query);
    }


    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoriesService.findOne(+id);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body('name') name: string,
        @Body('is_parent_category') is_parent_category: boolean,
        @Body('parent_category_id') parent_category_id?: number,
    ) {
        return this.categoriesService.update(+id, name, is_parent_category, parent_category_id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(+id);
    }

    @Delete()
    removeMany(@Body() body: { ids: number[] }) {
        return this.categoriesService.removeMany(body.ids);
    }
}
