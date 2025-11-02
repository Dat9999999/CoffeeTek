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
import { VoucherService } from './voucher.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { ExchangeVoucherDTO } from './dto/exchange-voucher.dto';
import { GetAllDto } from '../common/dto/pagination.dto';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post()
  create(@Body() createVoucherDto: CreateVoucherDto) {
    return this.voucherService.create(createVoucherDto);
  }

  @Get()
  findAll(@Query() paginationDto: GetAllDto) {
    return this.voucherService.findAll(paginationDto);
  }

  @Get(':code')
  findOne(@Param('code') query: string) {
    return this.voucherService.findOne(query);
  }

  @Put()
  exchangeVoucher(@Query('id') id: number, @Body() dto: ExchangeVoucherDTO) {
    return this.voucherService.exchangeVoucher(id, dto);
  }

  @Delete()
  remove(@Body('voucherIds') voucherIds: number[]) {
    return this.voucherService.remove(voucherIds);
  }
}
