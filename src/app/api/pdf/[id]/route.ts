import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateInvoicePdfBuffer } from "@/lib/invoice-pdf";
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
      select: { id: true, invoiceNumber: true, pdfUrl: true },
    });

    if (!invoice) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (invoice.pdfUrl) {
      const cloudinaryResponse = await fetch(invoice.pdfUrl, { cache: "no-store" });
      if (cloudinaryResponse.ok) {
        const bytes = await cloudinaryResponse.arrayBuffer();
        return new NextResponse(bytes, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
          },
        });
      }
    }

    const { buffer, invoiceNumber } = await generateInvoicePdfBuffer(invoice.id, session.user.id);
    const bytes = new Uint8Array(buffer);

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return new NextResponse("PDF generation failed", { status: 500 });
  }
}
