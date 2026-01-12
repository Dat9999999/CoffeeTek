import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Put } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/order/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Role } from 'src/auth/decorator/role.decorator';
import { RolesGuard } from 'src/auth/strategy/role.strategy';
import { AuthGuard } from '@nestjs/passport';
import { GetAllOrderDto } from './dto/GetAllOrder.dto';
import { GetOrderHistoryDto } from './dto/GetOrderHistory.dto';
import { UpdateOrderStatusDTO } from './dto/UpdateOrderStatus.dto';
import { PaymentDTO } from './dto/payment.dto';
import { VerifyReturnUrl } from 'vnpay';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller('order')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
// @Role('owner', 'manager','cashier')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Get('process-count')
  getActiveOrderCount() {
    return this.orderService.getProcessOrderCount();
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }
  @Get('vnpay-ipn')
  vnpayIpn(@Query() query: any) {
    return this.orderService.vnpayIpn(query);
  }

  @Get()
  findAll(@Query() dto: GetAllOrderDto) {
    return this.orderService.findAll(dto);
  }
  @Get('vnpay-return')
  vnpayResponse(@Query() query: any) {
    return this.orderService.vnpayResponse(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(Number(id));
  }
  @Patch('status')
  updateStatus(@Body() dto: UpdateOrderStatusDTO) {
    return this.orderService.updateStatus(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
  @Patch('paid/cash')
  paid(@Body() paymentDTO: PaymentDTO) {
    return this.orderService.payByCash(paymentDTO);
  }
  @Post('paid/online')
  paidOnline(@Body() paymentDTO: PaymentDTO) {
    return this.orderService.payOnline(paymentDTO);
  }
  @Put(':id')
  updateOrderItems(@Param('id') id: string, @Body() updateItemsDto: UpdateOrderDto) {
    return this.orderService.updateItems(+id, updateItemsDto)
  }
  @Get('invoice/:orderId')
  getInvoice(@Param('orderId') orderId: string) {
    return this.orderService.getInvoice(+orderId);
  }

  @Get('history/customer')
  getOrderHistoryByCustomer(@Query() dto: GetOrderHistoryDto) {
    return this.orderService.getOrderHistoryByCustomerPhone(
      dto.customerPhone,
      dto.page,
      dto.size,
    );
  }

  @EventPattern('order_completed_email')
  async handleOrderCompletedEmail(
    @Payload() data: { orderId: number; customerPhone: string; finalPrice: number },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    console.log(`📬 [OrderController] Received order_completed_email event for order ${data.orderId}`);

    try {
      await this.orderService.sendOrderCompletionEmail(data);
      // Acknowledge the message
      channel.ack(originalMsg);
      console.log(`✅ [OrderController] Successfully processed email for order ${data.orderId}`);
    } catch (error) {
      console.error(`❌ [OrderController] Error processing email for order ${data.orderId}:`, error);
      // Nack and requeue on error
      channel.nack(originalMsg, false, true);
    }
  }

}
