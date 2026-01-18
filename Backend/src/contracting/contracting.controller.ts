import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventPattern, Payload, Ctx } from '@nestjs/microservices';
import { RmqContext } from '@nestjs/microservices';
import { ContractingService } from './contracting.service';
import { CreateContractingDto } from './dto/create-contracting.dto';
import { UpdateContractingDto } from './dto/update-contracting.dto';
import { GetAllContractingDto } from './dto/get-all-contracting.dto';
import { CalculateRemainingDto } from './dto/calculate-remaining.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/user.decorator';
import { ParseDatePipe } from 'src/common/pipe/binding-pipe/parse-date.pipe';

@Controller('contracting')
export class ContractingController {
  constructor(private readonly contractingService: ContractingService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body() createContractingDto: CreateContractingDto,
    @GetUser() user: any,
  ) {
    return this.contractingService.create(createContractingDto, user?.id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Query() query: GetAllContractingDto) {
    return this.contractingService.findAll(query);
  }

  @Get('by-date')
  @UseGuards(AuthGuard('jwt'))
  getByDate(@Query('date', ParseDatePipe) date: Date) {
    return this.contractingService.getByDate(date);
  }

  @Get('calculate-consumption')
  @UseGuards(AuthGuard('jwt'))
  async calculateConsumption(@Query('date', ParseDatePipe) date: Date) {
    const consumptionMap = await this.contractingService.calculateActualConsumption(date);
    
    // Convert Map to array for JSON response
    const consumptionArray = Array.from(consumptionMap.entries()).map(([materialId, consumed]) => ({
      materialId,
      consumed,
    }));

    return {
      date: date.toISOString().split('T')[0],
      consumption: consumptionArray,
    };
  }

  @Get('consumption-records')
  @UseGuards(AuthGuard('jwt'))
  async getConsumptionRecords(@Query('date', ParseDatePipe) date: Date) {
    return this.contractingService.getConsumptionRecordsByDate(date);
  }

  @Post('calculate-remaining')
  @UseGuards(AuthGuard('jwt'))
  calculateRemaining(
    @Body() calculateRemainingDto: CalculateRemainingDto,
    @Query('autoRecord') autoRecord?: string,
  ) {
    const shouldAutoRecord = autoRecord === 'true';
    return this.contractingService.calculateRemaining(
      calculateRemainingDto,
      shouldAutoRecord,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.contractingService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() updateContractingDto: UpdateContractingDto,
  ) {
    return this.contractingService.update(+id, updateContractingDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.contractingService.remove(+id);
  }

  @EventPattern('calculate_material_consumption')
  async handleMaterialConsumption(
    @Payload() data: { orderId: number },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    console.log(`📬 [ContractingController] Received calculate_material_consumption event for order ${data.orderId}`);

    try {
      await this.contractingService.calculateAndStoreConsumption(data.orderId);
      // Acknowledge the message
      channel.ack(originalMsg);
      console.log(`✅ [ContractingController] Successfully processed consumption for order ${data.orderId}`);
    } catch (error) {
      console.error(`❌ [ContractingController] Error processing consumption for order ${data.orderId}:`, error);
      // Nack and requeue on error
      channel.nack(originalMsg, false, true);
    }
  }
}

