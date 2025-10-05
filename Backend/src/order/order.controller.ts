import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/order/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Role } from 'src/auth/decorator/role.decorator';
import { RolesGuard } from 'src/auth/strategy/role.strategy';
import { AuthGuard } from '@nestjs/passport';
import { GetAllOrderDto } from './dto/GetAllOrder.dto';
import { PaymentDTO } from './dto/payment.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Role('owner', 'manager', 'cashier')
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  findAll(@Query() dto: GetAllOrderDto) {
    return this.orderService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }
  @Patch('status')
  updateStatus(@Body() dto: any) {

  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
  @Patch('paid/cash')
  paid(@Body() paymentDTO: PaymentDTO) {
    return this.orderService.payByCash(paymentDTO);
  }
  @Patch('paid/online')
  paidOnline(@Body() paymentDTO: any) {
    return
  }
}
