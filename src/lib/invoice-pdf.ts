import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { PDFDocument } from "@/components/pdf/PDFDocument";
import { toLineItems, toMilestones } from "@/components/pdf/shared/helpers";
import { PDFInvoice } from "@/components/pdf/shared/types";
import { isCloudinaryConfigured, uploadPdfToCloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export async function generateInvoicePdfBuffer(
  invoiceId: string,
  userId: string,
): Promise<{ buffer: Buffer; invoiceNumber: string }> {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  const normalizedInvoice: PDFInvoice = {
    ...invoice,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    servicePeriodStart: invoice.servicePeriodStart?.toISOString() || null,
    servicePeriodEnd: invoice.servicePeriodEnd?.toISOString() || null,
    lineItems: toLineItems(invoice.lineItems),
    milestones: toMilestones(invoice.milestones),
    subtotal: Number(invoice.subtotal),
    discountAmount: Number(invoice.discountAmount || 0),
    taxRate: Number(invoice.taxRate),
    taxAmount: Number(invoice.taxAmount),
    total: Number(invoice.total),
  };

  const document = React.createElement(PDFDocument, {
    invoice: normalizedInvoice,
    profile,
  });

  const pdfBuffer = await renderToBuffer(document as React.ReactElement);

  return {
    buffer: Buffer.from(pdfBuffer),
    invoiceNumber: invoice.invoiceNumber,
  };
}

export async function syncInvoicePdfToCloudinary(
  invoiceId: string,
  userId: string,
): Promise<void> {
  if (!isCloudinaryConfigured()) return;

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
    select: { id: true, invoiceNumber: true },
  });

  if (!invoice) return;

  const { buffer } = await generateInvoicePdfBuffer(invoiceId, userId);
  const fileName = `${invoice.invoiceNumber}.pdf`;
  const publicId = `${userId}/${invoice.invoiceNumber}`;
  const upload = await uploadPdfToCloudinary({
    fileBuffer: buffer,
    fileName,
    publicId,
  });

  if (!upload) return;

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      pdfUrl: upload.url,
      pdfPublicId: upload.publicId,
    },
  });
}
