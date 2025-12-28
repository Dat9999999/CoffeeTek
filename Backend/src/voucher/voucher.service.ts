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
import { GetVoucherGroupDto } from './dto/get-voucher-group.dto';
import { GetAllVoucherDto } from './dto/get-all-voucher.dto';

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
  async create(createVoucherDto: CreateVoucherDto) {
    let groupName = createVoucherDto.groupName;

    // Nếu FE không truyền groupName → tự tạo + đảm bảo unique
    if (!groupName) {
      groupName = await this.generateUniqueGroupName(createVoucherDto.prefix);
    }

    for (let index = 0; index < createVoucherDto.quantity; index++) {
      await this.createVoucher(createVoucherDto, groupName);
    }

    return {
      ...createVoucherDto,
      groupName,
    };
  }



  async createVoucher(voucherDetails: CreateVoucherDto, groupName: string) {
    const code = await this.generateUniqueVoucherCode();

    const newVoucher = await this.prisma.voucher.create({
      data: {
        code,
        voucher_name: voucherDetails.voucherName || 'Voucher',
        group_name: groupName,
        valid_from: voucherDetails.validFrom,
        valid_to: voucherDetails.validTo,
        requirePoint: voucherDetails.requirePoint,
        minAmountOrder: voucherDetails.minAmountOrder,
        discount_percentage: voucherDetails.discountRate,
      },
    });

    return newVoucher;
  }


  async findAll(paginationDto: GetAllVoucherDto) {
    const {
      page = 1,
      size = 10,
      orderBy = 'id',
      orderDirection = 'asc',
      searchName,
      groupName,
      isActive,
    } = paginationDto;

    const skip = (page - 1) * size;

    const where: any = {};

    // 🔍 Tìm theo mã voucher
    if (searchName) {
      where.code = {
        contains: searchName,
        mode: 'insensitive',
      };
    }

    // 🔍 Lọc theo groupName
    if (groupName) {
      where.group_name = {
        contains: groupName,
        mode: 'insensitive',
      };
    }

    // 🔍 Lọc active / inactive
    if (typeof isActive === 'boolean') {
      where.is_active = isActive;
    }

    // 📦 Query DB
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

  async generateUniqueGroupName(prefix?: string): Promise<string> {
    let groupName: string;
    let isUnique = false;

    do {
      const date = new Date();
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');

      const random = Math.random().toString(36).substring(2, 8).toUpperCase();

      const pre = prefix ? prefix.toUpperCase() : 'VOUCHER';
      groupName = `${pre}_${y}${m}${d}_${random}`;

      // ❗ Kiểm tra trong DB
      const exists = await this.prisma.voucher.findFirst({
        where: { group_name: groupName },
      });

      isUnique = !exists;
    } while (!isUnique);

    return groupName;
  }

  async findVoucherGroups(paginationDto: GetVoucherGroupDto) {
    const {
      page = 1,
      size = 10,
      orderBy = 'group_name',
      orderDirection = 'asc',
      searchName,
      onlyActive,
    } = paginationDto;

    const skip = (page - 1) * size;

    // Điều kiện lọc nhóm
    const where: any = {};
    if (searchName) {
      where.voucher_name = { contains: searchName, mode: 'insensitive' };
    }
    if (onlyActive) {
      where.is_active = true; // nếu onlyActive = true thì chỉ lấy voucher active
    }

    // Lấy nhóm distinct với tổng voucher, voucher_name đại diện, discount và valid dates
    const groups = await this.prisma.voucher.groupBy({
      by: ['group_name'],
      where,
      _count: { _all: true },
      _min: {
        voucher_name: true,
        discount_percentage: true,
        valid_from: true,
      },
      _max: {
        discount_percentage: true,
        valid_to: true,
      },
      orderBy: { group_name: orderDirection },
      skip,
      take: size,
    });

    // Đếm active/inactive theo group
    const results = await Promise.all(
      groups.map(async (group) => {
        const counts = await this.prisma.voucher.groupBy({
          by: ['is_active'],
          where: { group_name: group.group_name },
          _count: { _all: true },
        });

        const activeCount = counts.find(c => c.is_active === true)?._count?._all || 0;
        const inactiveCount = counts.find(c => c.is_active === false)?._count?._all || 0;

        return {
          group_name: group.group_name,
          voucher_name: group._min?.voucher_name || null,
          discount_percentage: group._min?.discount_percentage || group._max?.discount_percentage || null,
          valid_from: group._min?.valid_from || null,
          valid_to: group._max?.valid_to || null,
          total: group._count?._all || 0,
          active: activeCount,
          inactive: inactiveCount,
        };
      })
    );

    // Tổng số group
    const totalGroups = await this.prisma.voucher.groupBy({
      by: ['group_name'],
      where,
    }).then(res => res.length);

    return {
      data: results,
      meta: {
        total: totalGroups,
        page,
        size,
        totalPages: Math.ceil(totalGroups / size),
      },
    };
  }



  // --- Exchange voucher theo group ---
  async exchangeVoucherByGroup(groupName: string, customerPhone: string) {
    return await this.prisma.$transaction(async (tx) => {
      const voucher = await tx.voucher.findFirst({
        where: { group_name: groupName, customerPhone: null, is_active: true },
      });
      if (!voucher) throw new NotFoundException(`No available voucher in group ${groupName}`);

      await tx.voucher.update({
        where: { id: voucher.id },
        data: { customerPhone },
      });

      return voucher;
    });
  }

  // --- Lấy voucher active của người dùng ---
  async findActiveVouchersByCustomer(customerPhone: string) {
    return  await this.prisma.voucher.findMany({
      where: {
        customerPhone,
        is_active: true,
      },
      orderBy: { valid_from: 'desc' },
    });
    // return "test";
  }

  // --- Xóa voucher theo group ---
  async removeByGroup(groupName: string | null) {
    if (groupName === "null") {
      groupName = null;
    }
    return this.prisma.voucher.deleteMany({
      where: { group_name: groupName },
    });
  }



}
