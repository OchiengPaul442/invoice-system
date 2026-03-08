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

interface PdfOptions {
  download: boolean;
  format?: "binary" | "base64";
  fileName?: string | null;
}

async function resolvePdfBytes({
  invoiceId,
  userId,
  fileName,
}: {
  invoiceId: string;
  userId: string;
  fileName?: string | null;
}): Promise<{
  bytes: Uint8Array;
  fileName: string;
}> {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
    select: { id: true, invoiceNumber: true, pdfUrl: true },
  });

  if (!invoice) {
    throw new Error("Not Found");
  }

  const safeFileName = fileName || invoice.invoiceNumber;

  if (invoice.pdfUrl) {
    const cloudinaryResponse = await fetch(invoice.pdfUrl, { cache: "no-store" });
    if (cloudinaryResponse.ok) {
      const bytes = new Uint8Array(await cloudinaryResponse.arrayBuffer());
      if (
        isPdfContentType(cloudinaryResponse.headers.get("content-type")) &&
        hasPdfSignature(bytes)
      ) {
        return {
          bytes,
          fileName: `${safeFileName}.pdf`,
        };
      }
    }
  }

  const { buffer, invoiceNumber } = await generateInvoicePdfBuffer(invoice.id, userId);
  return {
    bytes: new Uint8Array(buffer),
    fileName: `${safeFileName || invoiceNumber}.pdf`,
  };
}

async function buildPdfResponse({
  invoiceId,
  userId,
  download,
  format,
  fileName,
}: {
  invoiceId: string;
  userId: string;
  download: boolean;
  format?: "binary" | "base64";
  fileName?: string | null;
}): Promise<NextResponse> {
  const payload = await resolvePdfBytes({
    invoiceId,
    userId,
    fileName,
  });

  if (format === "base64") {
    return NextResponse.json({
      success: true,
      data: {
        fileName: payload.fileName,
        contentType: "application/pdf",
        base64: Buffer.from(payload.bytes).toString("base64"),
      },
    });
  }

  const dispositionType = download ? "attachment" : "inline";
  return new NextResponse(Buffer.from(payload.bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${dispositionType}; filename="${payload.fileName}"`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
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
    const { searchParams } = new URL(req.url);
    const options: PdfOptions = {
      download: searchParams.get("download") === "1",
      format: "binary",
      fileName: searchParams.get("filename"),
    };

    return buildPdfResponse({
      invoiceId: params.id,
      userId: session.user.id,
      ...options,
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    if (error instanceof Error && error.message === "Not Found") {
      return new NextResponse("Not Found", { status: 404 });
    }
    return new NextResponse("PDF generation failed", { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as Partial<PdfOptions>;

    return buildPdfResponse({
      invoiceId: params.id,
      userId: session.user.id,
      download: body.download ?? true,
      format: body.format ?? "binary",
      fileName: body.fileName ?? null,
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    if (error instanceof Error && error.message === "Not Found") {
      return new NextResponse("Not Found", { status: 404 });
    }
    return new NextResponse("PDF generation failed", { status: 500 });
  }
}
