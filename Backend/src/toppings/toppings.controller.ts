import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ToppingsService } from './toppings.service';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';
import { GetAllToppingsDto } from './dto/get-all-toppings.dto';

@Controller('toppings')
export class ToppingsController {
    constructor(private readonly toppingsService: ToppingsService) { }

    @Post()
    create(@Body() dto: CreateToppingDto) {
        return this.toppingsService.create(dto);
    }

    @Get()
    findAll(@Query() query: GetAllToppingsDto) {
        return this.toppingsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.toppingsService.findOne(+id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateToppingDto) {
        return this.toppingsService.update(+id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.toppingsService.remove(+id);
    }
}
