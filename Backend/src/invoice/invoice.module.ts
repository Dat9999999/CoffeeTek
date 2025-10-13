import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';

@Module({
  providers: [InvoiceService]
})
export class InvoiceModule {}
