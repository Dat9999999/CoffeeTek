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
import { ContractingService } from './contracting.service';
import { CreateContractingDto } from './dto/create-contracting.dto';
import { UpdateContractingDto } from './dto/update-contracting.dto';
import { GetAllContractingDto } from './dto/get-all-contracting.dto';
import { CalculateRemainingDto } from './dto/calculate-remaining.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/user.decorator';
import { ParseDatePipe } from 'src/common/pipe/binding-pipe/parse-date.pipe';

@Controller('contracting')
@UseGuards(AuthGuard('jwt'))
export class ContractingController {
  constructor(private readonly contractingService: ContractingService) {}

  @Post()
  create(
    @Body() createContractingDto: CreateContractingDto,
    @GetUser() user: any,
  ) {
    return this.contractingService.create(createContractingDto, user?.id);
  }

  @Get()
  findAll(@Query() query: GetAllContractingDto) {
    return this.contractingService.findAll(query);
  }

  @Get('by-date')
  getByDate(@Query('date', ParseDatePipe) date: Date) {
    return this.contractingService.getByDate(date);
  }

  @Get('calculate-consumption')
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

  @Post('calculate-remaining')
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
  findOne(@Param('id') id: string) {
    return this.contractingService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContractingDto: UpdateContractingDto,
  ) {
    return this.contractingService.update(+id, updateContractingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractingService.remove(+id);
  }
}

