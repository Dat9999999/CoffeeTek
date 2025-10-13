import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs'
import { Order } from '@prisma/client';
const PDFDocument = require('pdfkit');
import path from 'path';

@Injectable()
export class InvoiceService {
  async createInvoice(order: Order) {
    const now = new Date();
    const dirPath = path.join(process.cwd(), 'invoices', `${now.getFullYear()}`, `${now.getMonth() + 1}`);
    fs.mkdirSync(dirPath, { recursive: true });
    const fileName = `invoice-${order.id}.pdf`;
    const filePath = path.join(dirPath, fileName);

    const doc = new PDFDocument()
    const writeStream = fs.createWriteStream(filePath)
    doc.pipe(writeStream)

    doc.fontSize(18).text(`HÓA ĐƠN #${order.id}`, { align: 'center' });
    doc.moveDown();
    doc.text(`Khách hàng: ${order.customerPhone}`);
    doc.text(`Tổng tiền: ${order.final_price.toLocaleString()} VND`);
    doc.text(`Ngày: ${now.toLocaleString()}`);
    doc.end();

    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    Logger.log(`create invoice at ${filePath}`)

    // Cập nhật đường dẫn file PDF vào order
    // await this.prisma.order.update({
    //   where: { orderNo },
    //   data: { invoiceFilePath: filePath },
    // });

    return { message: 'Đơn hàng đã hoàn tất & hóa đơn đã tạo', filePath };

  }
}
