import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client/extension';

@Injectable()
export class InventoryService {
    constructor(private readonly prisma: PrismaClient) { }
}
