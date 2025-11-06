import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as voucher_codes from 'voucher-code-generator';
import { ExchangeVoucherDTO } from './dto/exchange-voucher.dto';
import { GetAllDto } from '../common/dto/pagination.dto';

@Injectable()
export class VoucherService {
  constructor(private readonly prisma: PrismaService) { }

  async exchangeVoucher(id: number, dto: ExchangeVoucherDTO) {
    await this.prisma.$transaction(async (tx) => {
      const voucher = await tx.voucher.findUnique({ where: { id } });
      if (!voucher) throw new NotFoundException(`not found voucher id : ${id}`);

      const customer = await tx.user.findUnique({
        where: { phone_number: dto.customerPhone },
        include: {
          CustomerPoint: true,
        },
      });
      if (!customer || !customer.CustomerPoint)
        throw new NotFoundException(
          `not found customer phone  : ${dto.customerPhone}`,
        );

      if (voucher.requirePoint > customer.CustomerPoint?.points)
        throw new BadRequestException(
          `Customer point is not enough to exchange this voucher`,
        );

      // user exchange voucher
      await tx.voucher.update({
        where: { id },
        data: {
          customerPhone: dto.customerPhone,
        },
      });
    });
    return dto;
  }

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
      const existingVoucher = await this.prisma.voucher.findUnique({
        where: { code },
      });
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
        requirePoint: voucherDetails.requirePoint,
        minAmountOrder: voucherDetails.minAmountOrder,
        discount_percentage: voucherDetails.discountRate,
      },
    });

    return newVoucher;
  }

  async create(createVoucherDto: CreateVoucherDto) {
    for (let index = 0; index < createVoucherDto.quantity; index++) {
      await this.createVoucher(createVoucherDto);
    }
    return createVoucherDto;
  }

  async findAll(paginationDto: GetAllDto) {
    const {
      page,
      size,
      orderBy = 'id',
      orderDirection = 'asc',
      searchName,
    } = paginationDto;

    const skip = (page - 1) * size;

    const where: any = {};

    if (searchName) {
      where.code = {
        contains: searchName,
        mode: 'insensitive',
      };
    }

    const [vouchers, total] = await Promise.all([
      this.prisma.voucher.findMany({
        skip,
        take: size,
        orderBy: { [orderBy]: orderDirection },
        where,
      }),
      this.prisma.voucher.count({ where }),
    ]);

    return {
      data: vouchers,
      meta: {
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  async findOne(code: string) {
    return await this.prisma.voucher.findUnique({
      where: { code: code, is_active: true },
    });
  }

  update(id: number, updateVoucherDto: UpdateVoucherDto) {
    return `This action updates a #${id} voucher`;
  }

  async remove(ids: number[]) {
    return await this.prisma.voucher.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
