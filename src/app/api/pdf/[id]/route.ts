import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateInvoicePdfBuffer } from "@/lib/invoice-pdf";
import { prisma } from "@/lib/prisma";

function isPdfContentType(contentType: string | null): boolean {
  if (!contentType) return false;
  return contentType.includes("application/pdf") || contentType.includes("application/octet-stream");
}

function hasPdfSignature(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  );
}

export async function GET(
  req: NextRequest,
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

    const { searchParams } = new URL(req.url);
    const download = searchParams.get("download") === "1";
    const fileName = searchParams.get("filename") || invoice.invoiceNumber;
    const dispositionType = download ? "attachment" : "inline";

    if (invoice.pdfUrl) {
      const cloudinaryResponse = await fetch(invoice.pdfUrl, { cache: "no-store" });
      if (cloudinaryResponse.ok) {
        const bytes = new Uint8Array(await cloudinaryResponse.arrayBuffer());
        if (
          isPdfContentType(cloudinaryResponse.headers.get("content-type")) &&
          hasPdfSignature(bytes)
        ) {
          return new NextResponse(bytes, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `${dispositionType}; filename="${fileName}.pdf"`,
              "Cache-Control": "no-store, no-cache, must-revalidate",
              "X-Content-Type-Options": "nosniff",
            },
          });
        }
      }
    }

    const { buffer, invoiceNumber } = await generateInvoicePdfBuffer(invoice.id, session.user.id);
    const bytes = new Uint8Array(buffer);

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${dispositionType}; filename="${fileName || invoiceNumber}.pdf"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return new NextResponse("PDF generation failed", { status: 500 });
  }
}
