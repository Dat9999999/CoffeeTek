import { Injectable } from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as voucher_codes from 'voucher-code-generator';

@Injectable()
export class VoucherService {
  constructor(private readonly prisma: PrismaService) { }
  async generateUniqueVoucherCode(): Promise<string> {
    let code: string;
    let isUnique = false;

    // A loop to ensure the generated code does not already exist in the database
    // This is a crucial security step.
    do {
      // Configuration for the code (e.g., length, prefix, pattern)
      code = voucher_codes.generate({
        length: 8,
        count: 1,
        charset: 'alphanumeric',
        prefix: 'PROMO-',
        postfix: '',
        pattern: '####-####', // Example pattern: ABCD-1234
      })[0];

      // **IMPORTANT**: Check if the code exists in your database
      // Replace with your actual database query
      const existingVoucher = await this.prisma.voucher.findUnique({ where: { code } });
      isUnique = !existingVoucher;

    } while (!isUnique);

    return code;
  }

  async createVoucher(voucherDetails: CreateVoucherDto) {
    const code = await this.generateUniqueVoucherCode();

    // Save the new voucher record to the database
    const newVoucher = await this.prisma.voucher.create({
      data: {
        code: code,
        valid_from: voucherDetails.validFrom,
        valid_to: voucherDetails.validTo,
        requireLevel: {
          connect: { id: voucherDetails.requireLevelId }
        },
        minAmountOrder: voucherDetails.minAmountOrder,
        discount_percentage: voucherDetails.discountRate
      }
    })

    return newVoucher;
  }
  async create(createVoucherDto: CreateVoucherDto) {
    for (let index = 0; index < createVoucherDto.quantity; index++) {
      await this.createVoucher(createVoucherDto)
    }
    return createVoucherDto
  }

  async findAll() {
    return await this.prisma.voucher.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} voucher`;
  }

  update(id: number, updateVoucherDto: UpdateVoucherDto) {
    return `This action updates a #${id} voucher`;
  }

  remove(id: number) {
    return `This action removes a #${id} voucher`;
  }
}
