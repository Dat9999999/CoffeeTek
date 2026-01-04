import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { GetAllDto } from '../common/dto/pagination.dto';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) { }

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

  @Patch(':id/active')
  toggleActive(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.promotionService.toggleActive(+id, isActive);
  }


  @Delete()
  removeMany(@Body() body: { ids: number[] }) {
    return this.promotionService.removeMany(body.ids);
  }

  @EventPattern('promotion_created_event') // 1. Must match exactly the string in .emit()
  async handlePromotionCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    return this.promotionService.sendPromotionCreatedEvent(data, channel, originalMsg);

    


  }

}
