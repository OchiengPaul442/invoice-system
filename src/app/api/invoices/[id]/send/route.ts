import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateInvoicePdfBuffer, syncInvoicePdfToCloudinary } from "@/lib/invoice-pdf";
import { sendTransactionalEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

function isPdfPayload(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  );
}

async function getCloudPdfAttachment(pdfUrl: string | null): Promise<Buffer | null> {
  if (!pdfUrl) return null;

  const response = await fetch(pdfUrl, { cache: "no-store" });
  if (!response.ok) return null;

  const contentType = response.headers.get("content-type") || "";
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!contentType.includes("application/pdf") || !isPdfPayload(bytes)) {
    return null;
  }

  return Buffer.from(bytes);
}

function invoiceEmailHtml({
  recipientName,
  senderName,
  appName,
  dueDate,
  invoiceNumber,
  amountDue,
  currency,
}: {
  recipientName: string;
  senderName: string;
  appName: string;
  dueDate: Date;
  invoiceNumber: string;
  amountDue: number;
  currency: string;
}): string {
  return `
  <div style="font-family:'Aptos','Segoe UI',Arial,sans-serif;line-height:1.55;color:#0f172a;max-width:680px;margin:0 auto;padding:24px;background:#f3f4f6">
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden">
      <div style="padding:20px 28px;background:linear-gradient(120deg,#0f766e,#0b4f55);color:#f8fafc">
        <p style="margin:0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.82">${appName}</p>
        <h2 style="margin:10px 0 0;font-size:28px;font-weight:700;letter-spacing:.01em">Invoice ${invoiceNumber}</h2>
      </div>
      <div style="padding:28px">
        <p style="margin:0 0 14px;color:#334155;font-size:16px">Hello ${recipientName},</p>
        <p style="margin:0 0 18px;color:#334155;font-size:16px">
          Please find your invoice attached as a PDF document. Kindly review the details and process payment by the due date shown below.
        </p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:20px">
          <p style="margin:0 0 8px"><strong>Amount due:</strong> ${formatCurrency(amountDue, currency)}</p>
          <p style="margin:0 0 8px"><strong>Due date:</strong> ${formatDate(dueDate)}</p>
          <p style="margin:0"><strong>Invoice number:</strong> ${invoiceNumber}</p>
        </div>
        <p style="margin:0;color:#64748b;font-size:14px">
          This email includes the official invoice PDF as an attachment for your records.
        </p>
        <p style="margin:18px 0 0;color:#0f172a;font-size:14px;font-weight:600">${senderName}</p>
        <p style="margin:2px 0 0;color:#64748b;font-size:13px">${appName}</p>
      </div>
    </div>
  </div>
  `.trim();
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const appName = process.env.NEXT_PUBLIC_APP_NAME || "LedgerBloom";

    const [invoice, settings, profile] = await Promise.all([
      prisma.invoice.findFirst({
        where: { id: params.id, userId: session.user.id },
        select: {
          id: true,
          userId: true,
          invoiceNumber: true,
          billToEmail: true,
          billToName: true,
          total: true,
          currency: true,
          dueDate: true,
          status: true,
          pdfUrl: true,
        },
      }),
      prisma.invoiceSettings.findUnique({
        where: { userId: session.user.id },
        select: { sendCopyToSelf: true },
      }),
      prisma.userProfile.findUnique({
        where: { userId: session.user.id },
        select: { businessName: true, businessEmail: true },
      }),
    ]);

    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    try {
      await syncInvoicePdfToCloudinary(invoice.id, session.user.id);
    } catch (error) {
      console.error("Cloudinary sync before email failed:", error);
    }

    const refreshed = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      select: {
        id: true,
        userId: true,
        invoiceNumber: true,
        billToEmail: true,
        billToName: true,
        total: true,
        currency: true,
        dueDate: true,
        pdfUrl: true,
        status: true,
      },
    });

    if (!refreshed) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    const senderName = profile?.businessName || appName;
    const subject = `Invoice ${refreshed.invoiceNumber} from ${senderName}`;
    const html = invoiceEmailHtml({
      recipientName: refreshed.billToName || "there",
      senderName,
      appName,
      invoiceNumber: refreshed.invoiceNumber,
      dueDate: refreshed.dueDate,
      amountDue: Number(refreshed.total),
      currency: refreshed.currency,
    });
    const text = [
      `Invoice ${refreshed.invoiceNumber}`,
      `From: ${senderName}`,
      `Amount due: ${formatCurrency(Number(refreshed.total), refreshed.currency)}`,
      `Due: ${formatDate(refreshed.dueDate)}`,
      `Reference: ${refreshed.invoiceNumber}`,
      "The invoice PDF is attached to this email.",
    ].join("\n");
    let attachmentBuffer = await getCloudPdfAttachment(refreshed.pdfUrl);
    if (!attachmentBuffer) {
      const generated = await generateInvoicePdfBuffer(refreshed.id, refreshed.userId);
      attachmentBuffer = generated.buffer;
    }

    await sendTransactionalEmail({
      to: [refreshed.billToEmail],
      cc: settings?.sendCopyToSelf && session.user.email ? [session.user.email] : undefined,
      replyTo: profile?.businessEmail || undefined,
      subject,
      html,
      text,
      attachments: [
        {
          filename: `${refreshed.invoiceNumber}.pdf`,
          content: attachmentBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    await prisma.$transaction(async (tx) => {
      if (refreshed.status === "DRAFT") {
        await tx.invoice.update({
          where: { id: refreshed.id },
          data: { status: "SENT", sentAt: new Date() },
        });
      }

      await tx.invoiceActivity.create({
        data: {
          invoiceId: refreshed.id,
          action: "emailed",
          note: `Invoice emailed to ${refreshed.billToEmail}`,
        },
      });
    });

    return NextResponse.json({ success: true, data: { sent: true } });
  } catch (error) {
    console.error("Send invoice email failed:", error);
    const message = error instanceof Error ? error.message : "Failed to send invoice email";
    const isConfigError = message.includes("Missing");

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: isConfigError ? 400 : 500 },
    );
  }
}
