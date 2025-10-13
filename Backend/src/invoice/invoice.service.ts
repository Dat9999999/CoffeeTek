import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { Order, OrderDetail } from '@prisma/client';
import path from 'path';
const PDFDocument = require('pdfkit'); // ✅ Use proper default import with nodenext

@Injectable()
export class InvoiceService {
  async createInvoice(order: Order, items?: OrderDetail[]) {
    const now = new Date();
    const dirPath = path.join(
      process.cwd(),
      'invoices',
      `${now.getFullYear()}`,
      `${now.getMonth() + 1}`,
    );

    //get all product items 
    const products =
      fs.mkdirSync(dirPath, { recursive: true });

    const fileName = `invoice-${order.id}.pdf`;
    const filePath = path.join(dirPath, fileName);

    // ✅ Create PDF Document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    Logger.log(`🧾 Creating invoice at: ${filePath}`);

    generateHeader(doc);
    generateCustomerInformation(doc, order);
    generateInvoiceTable(doc, order);
    generateFooter(doc);

    // ✅ End writing
    doc.end();

    // Optional: Wait until finished writing before returning
    return new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => {
        Logger.log(`✅ Invoice saved: ${filePath}`);
        resolve();
      });
      writeStream.on('error', reject);
    });
  }
}

/* ============================
   PDF Helper Functions
============================ */

function generateHeader(doc: any) {
  doc
    .fillColor('#444444')
    .fontSize(20)
    .text('CoffeeTek', 110, 57)
    .fontSize(10)
    .text('CoffeeTek', 200, 50, { align: 'right' })
    .text('123 Main Street', 200, 65, { align: 'right' })
    .text('Ho Chi Minh City, VN', 200, 80, { align: 'right' })
    .moveDown();
}

function generateCustomerInformation(doc: any, invoice: Order) {
  doc.fillColor('#444444').fontSize(20).text('Invoice', 50, 160);
  generateHr(doc, 185);

  const customerInformationTop = 200;
  doc.fontSize(10)
    .text('Invoice Number:', 50, customerInformationTop)
    .font('Helvetica-Bold')
    .text(invoice.id.toString(), 150, customerInformationTop)
    .font('Helvetica')
    .text('Invoice Date:', 50, customerInformationTop + 15)
    .text(formatDate(new Date()), 150, customerInformationTop + 15);

  generateHr(doc, 252);
}

function generateInvoiceTable(doc: any, invoice: any) {
  const invoiceTableTop = 330;
  doc.font('Helvetica-Bold');
  generateTableRow(doc, invoiceTableTop, 'Item', 'Qty', 'Price', 'Total');
  generateHr(doc, invoiceTableTop + 20);
  doc.font('Helvetica');

  let i = 0;
  for (const item of invoice.items ?? []) {
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.name,
      item.quantity.toString(),
      formatCurrency(item.price),
      formatCurrency(item.price * item.quantity),
    );
    generateHr(doc, position + 20);
    i++;
  }
}

function generateFooter(doc: any) {
  doc
    .fontSize(10)
    .text('Thank you for your business.', 50, 780, {
      align: 'center',
      width: 500,
    });
}

function generateTableRow(
  doc: any,
  y: number,
  item: string,
  quantity: string,
  price: string,
  total: string,
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(quantity, 280, y, { width: 90, align: 'right' })
    .text(price, 370, y, { width: 90, align: 'right' })
    .text(total, 0, y, { align: 'right' });
}

function generateHr(doc: any, y: number) {
  doc
    .strokeColor('#aaaaaa')
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function formatCurrency(amount: number) {
  return `${amount.toLocaleString('vi-VN')} ₫`;
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}
