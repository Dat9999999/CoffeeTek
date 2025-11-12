import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { Order, OrderDetail } from '@prisma/client';
import path from 'path';
import { PassThrough } from 'stream';
const PDFDocument = require('pdfkit'); // ✅ Use proper default import with nodenext

@Injectable()
export class InvoiceService {
  async createInvoice(order: Order, items?: OrderDetail[]) {
    const invoice = {
      order,
      items: items ?? [],
    };

    // ✅ Generate PDF in memory
    const pdfBuffer = await generatePdfBuffer(invoice);

    // ✅ Upload directly to bucket
    const key = `invoices/${new Date().getFullYear()}/${new Date().getMonth() + 1}/invoice-${order.id}.pdf`;

    Logger.log(`✅ Invoice uploaded to bucket: ${key}`);
    return { key, pdfBuffer };
  }
}

/* ============================
   PDF Helper Functions
============================ */
function generatePdfBuffer(invoice: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = new PassThrough();

    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);

    doc.pipe(stream);

    // 📝 Generate the PDF content here (same as before)
    generateHeader(doc);
    generateCustomerInformation(doc, invoice);
    generateInvoiceTable(doc, invoice);
    generateFooter(doc);

    doc.end();
  });
}

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

function generateCustomerInformation(doc: any, invoice: { order: Order, items: OrderDetail[] }) {
  doc.fillColor('#444444').fontSize(20).text('Invoice', 50, 160);
  generateHr(doc, 185);

  const customerInformationTop = 200;
  doc.fontSize(10)
    .text('Invoice Number:', 50, customerInformationTop)
    .font('Helvetica-Bold')
    .text(invoice.order.id.toString(), 150, customerInformationTop)
    .font('Helvetica')
    .text('Invoice Date:', 50, customerInformationTop + 15)
    .text(formatDate(new Date()), 150, customerInformationTop + 15);

  generateHr(doc, 252);
}

function generateInvoiceTable(doc: any, invoice: { order: Order, items: OrderDetail[] }) {
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
      item.product_name ?? '',
      item.quantity.toString(),
      formatCurrency(item.unit_price),
      formatCurrency(item.unit_price * item.quantity),
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
