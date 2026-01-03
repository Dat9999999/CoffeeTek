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
import { GetVoucherGroupDto } from './dto/get-voucher-group.dto';
import { GetAllVoucherDto } from './dto/get-all-voucher.dto';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) { }

  @Get('groups')
  getVoucherGroups(@Query() query: GetVoucherGroupDto) {
    return this.voucherService.findVoucherGroups(query);
  }
  @Get('my-active')
  getMyActiveVouchers(@Query('customerPhone') customerPhone: string) {
    return this.voucherService.findActiveVouchersByCustomer(customerPhone);
  }

  @Post()
  create(@Body() createVoucherDto: CreateVoucherDto) {
    return this.voucherService.create(createVoucherDto);
  }

  @Get()
  findAll(@Query() paginationDto: GetAllVoucherDto) {
    return this.voucherService.findAll(paginationDto);
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.voucherService.findOne(code);
  }

  @Put()
  exchangeVoucher(@Query('id') id: number, @Body() dto: ExchangeVoucherDTO) {
    return this.voucherService.exchangeVoucher(id, dto);
  }

  @Delete()
  remove(@Body('voucherIds') voucherIds: number[]) {
    return this.voucherService.remove(voucherIds);
  }

  // --- Mới ---
  @Put('exchange-by-group')
  exchangeByGroup(@Body() dto: ExchangeVoucherDTO & { groupName: string }) {
    return this.voucherService.exchangeVoucherByGroup(dto.groupName, dto.customerPhone);
  }

 

  @Delete('group/:groupName')
  deleteByGroup(@Param('groupName') groupName: string) {
    return this.voucherService.removeByGroup(groupName);
  }
}
