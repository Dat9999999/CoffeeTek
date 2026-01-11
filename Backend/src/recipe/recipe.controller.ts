import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { ValidateRecipePipe } from './pipe/validate-recipe.pipe';

@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  //need to check there no duplicate materialIds in createRecipeDto.materials
  create(@Body(new ValidateRecipePipe()) createRecipeDto: CreateRecipeDto) {
    return this.recipeService.create(createRecipeDto);
  }

  @Get()
  findAll() {
    return this.recipeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recipeService.findOne(id);
  }

  @Get('/product/:id')
  findOneByProductId(@Param('id', ParseIntPipe) id: number) {
    return this.recipeService.findOneByProductId(id);
  }

  @Get('/cost/:productId')
  async getProductCost(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('sizeId') sizeId?: string,
  ) {
    const sizeIdNum = sizeId ? parseInt(sizeId) : undefined;
    const cost = await this.recipeService.calculateProductCost(
      productId,
      sizeIdNum,
    );
    return { productId, sizeId: sizeIdNum, cost };
  }

  @Get('/cost/:productId/breakdown')
  async getProductCostBreakdown(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('sizeId') sizeId?: string,
  ) {
    const sizeIdNum = sizeId ? parseInt(sizeId) : undefined;
    return this.recipeService.calculateProductCostWithBreakdown(
      productId,
      sizeIdNum,
    );
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidateRecipePipe()) updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipeService.update(id, updateRecipeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.recipeService.remove(id);
  }
}
