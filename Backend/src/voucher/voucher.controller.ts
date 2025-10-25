import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { ExchangeVoucherDTO } from './dto/exchange-voucher.dto';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) { }

  @Post()
  create(@Body() createVoucherDto: CreateVoucherDto) {
    return this.voucherService.create(createVoucherDto);
  }

  @Get()
  findAll() {
    return this.voucherService.findAll();
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
