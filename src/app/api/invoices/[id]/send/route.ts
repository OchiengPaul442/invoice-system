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
  <div style="font-family:'Segoe UI',Arial,sans-serif;line-height:1.58;color:#0f172a;max-width:700px;margin:0 auto;padding:24px;background:#f1f5f9">
    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden">
      <div style="padding:22px 30px;background:linear-gradient(120deg,#0f766e,#115e59);color:#f8fafc">
        <p style="margin:0;font-size:11px;letter-spacing:.18em;text-transform:uppercase;opacity:.88">${appName}</p>
        <h2 style="margin:10px 0 0;font-size:30px;font-weight:700;letter-spacing:.01em">Invoice ${invoiceNumber}</h2>
      </div>
      <div style="padding:30px">
        <p style="margin:0 0 14px;color:#334155;font-size:16px">Hello ${recipientName},</p>
        <p style="margin:0 0 18px;color:#334155;font-size:16px">
          Please find your invoice attached for your records. We kindly request payment by the due date below.
        </p>
        <div style="background:#f8fafc;border:1px solid #dbe4ee;border-radius:14px;padding:18px;margin-bottom:18px">
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:0 0 8px;color:#475569;font-size:14px">Amount due</td>
              <td style="padding:0 0 8px;text-align:right;font-size:20px;font-weight:700;color:#0f172a">${formatCurrency(amountDue, currency)}</td>
            </tr>
            <tr>
              <td style="padding:0 0 8px;color:#475569;font-size:14px">Due date</td>
              <td style="padding:0 0 8px;text-align:right;font-size:15px;font-weight:600;color:#0f172a">${formatDate(dueDate)}</td>
            </tr>
            <tr>
              <td style="padding:0;color:#475569;font-size:14px">Invoice number</td>
              <td style="padding:0;text-align:right;font-size:15px;font-weight:600;color:#0f172a">${invoiceNumber}</td>
            </tr>
          </table>
        </div>
        <p style="margin:0;color:#475569;font-size:14px">
          The official PDF invoice is attached to this email. Please include the invoice number when making payment.
        </p>
        <p style="margin:24px 0 0;color:#0f172a;font-size:14px;font-weight:600">Regards,</p>
        <p style="margin:4px 0 0;color:#0f172a;font-size:14px;font-weight:600">${senderName}</p>
        <p style="margin:2px 0 0;color:#64748b;font-size:13px">${appName} Billing</p>
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
      "Please find the official invoice PDF attached to this email.",
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
