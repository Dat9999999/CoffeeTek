import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { GetAllDto } from '../common/dto/pagination.dto';

@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionService.create(createPromotionDto);
  }

  @Get()
  findAll(@Query() paginationDto: GetAllDto) {
    return this.promotionService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promotionService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ) {
    return this.promotionService.update(+id, updatePromotionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promotionService.remove(+id);
  }
}
