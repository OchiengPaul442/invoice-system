import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "@/components/pdf/PDFDocument";
import { toLineItems, toMilestones } from "@/components/pdf/shared/helpers";
import { PDFInvoice } from "@/components/pdf/shared/types";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!invoice) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
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

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return new NextResponse("PDF generation failed", { status: 500 });
  }
}
