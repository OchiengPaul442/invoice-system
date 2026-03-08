import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateInvoicePdfBuffer, syncInvoicePdfToCloudinary } from "@/lib/invoice-pdf";
import { sendTransactionalEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

function invoiceEmailHtml({
  recipientName,
  senderName,
  dueDate,
  invoiceNumber,
  amountDue,
  currency,
}: {
  recipientName: string;
  senderName: string;
  dueDate: Date;
  invoiceNumber: string;
  amountDue: number;
  currency: string;
}): string {
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;line-height:1.6;color:#111827;max-width:680px;margin:0 auto;padding:24px;background:#f8fafc">
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:28px">
      <p style="margin:0 0 12px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#6b7280">Billing Notice</p>
      <h2 style="margin:0 0 10px;font-size:28px;color:#0f766e">Invoice ${invoiceNumber}</h2>
      <p style="margin:0 0 16px;color:#374151">Hello ${recipientName},</p>
      <p style="margin:0 0 16px;color:#374151">
        Please find your invoice attached as a PDF. It contains all billing details and payment instructions.
      </p>
      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:18px">
        <p style="margin:0 0 8px"><strong>Amount due:</strong> ${formatCurrency(amountDue, currency)}</p>
        <p style="margin:0 0 8px"><strong>Due date:</strong> ${formatDate(dueDate)}</p>
        <p style="margin:0"><strong>Invoice number:</strong> ${invoiceNumber}</p>
      </div>
      <p style="margin:0;color:#6b7280;font-size:14px">Thank you for your business.</p>
      <p style="margin:10px 0 0;color:#111827;font-size:14px">${senderName}</p>
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
    const appName = process.env.NEXT_PUBLIC_APP_NAME || "InvoiceFlow";

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
        select: { businessName: true },
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
      "The invoice PDF is attached to this email.",
    ].join("\n");
    const { buffer } = await generateInvoicePdfBuffer(refreshed.id, refreshed.userId);

    await sendTransactionalEmail({
      to: [refreshed.billToEmail],
      cc: settings?.sendCopyToSelf && session.user.email ? [session.user.email] : undefined,
      subject,
      html,
      text,
      attachments: [
        {
          filename: `${refreshed.invoiceNumber}.pdf`,
          content: buffer,
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
