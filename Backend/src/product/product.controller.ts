import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ProductsService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { GetAllProductsDto } from './dto/get-all-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';


@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  findAll(@Query() query: GetAllProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get('search')
  async search(@Query('keyword') keyword: string) {
    return this.productsService.search(keyword);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  @Delete()
  removeMany(@Body() body: { ids: number[] }) {
    return this.productsService.removeMany(body.ids);
  }

}
