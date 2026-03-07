import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendTransactionalEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

function invoiceEmailHtml({
  appUrl,
  invoiceNumber,
  billToName,
  total,
  currency,
  dueDate,
}: {
  appUrl: string;
  invoiceNumber: string;
  billToName: string;
  total: number;
  currency: string;
  dueDate: Date;
}): string {
  return `
  <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937;max-width:640px;margin:0 auto;padding:24px">
    <h2 style="margin:0 0 12px;font-size:24px;color:#0f766e">Invoice ${invoiceNumber}</h2>
    <p style="margin:0 0 12px">Hi ${billToName},</p>
    <p style="margin:0 0 12px">Your invoice is ready. Please review and pay by <strong>${formatDate(dueDate)}</strong>.</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0">
      <p style="margin:0 0 4px"><strong>Amount due:</strong> ${formatCurrency(total, currency)}</p>
      <p style="margin:0"><strong>Invoice number:</strong> ${invoiceNumber}</p>
    </div>
    <a href="${appUrl}/invoices" style="display:inline-block;background:#0f766e;color:white;text-decoration:none;padding:10px 16px;border-radius:10px">
      View Invoice
    </a>
    <p style="margin-top:20px;color:#64748b;font-size:12px">If you have questions, reply to this email.</p>
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
    const [invoice, settings] = await Promise.all([
      prisma.invoice.findFirst({
        where: { id: params.id, userId: session.user.id },
        select: {
          id: true,
          invoiceNumber: true,
          billToEmail: true,
          billToName: true,
          total: true,
          currency: true,
          dueDate: true,
          status: true,
        },
      }),
      prisma.invoiceSettings.findUnique({
        where: { userId: session.user.id },
        select: { sendCopyToSelf: true },
      }),
    ]);

    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

    const subject = `Invoice ${invoice.invoiceNumber} from ${process.env.NEXT_PUBLIC_APP_NAME || "InvoiceFlow"}`;
    const html = invoiceEmailHtml({
      appUrl,
      invoiceNumber: invoice.invoiceNumber,
      billToName: invoice.billToName,
      total: Number(invoice.total),
      currency: invoice.currency,
      dueDate: invoice.dueDate,
    });
    const text = `Invoice ${invoice.invoiceNumber}\nAmount due: ${formatCurrency(
      Number(invoice.total),
      invoice.currency,
    )}\nDue: ${formatDate(invoice.dueDate)}\nView: ${appUrl}/invoices`;

    await sendTransactionalEmail({
      to: [invoice.billToEmail],
      cc: settings?.sendCopyToSelf && session.user.email ? [session.user.email] : undefined,
      subject,
      html,
      text,
    });

    await prisma.$transaction(async (tx) => {
      if (invoice.status === "DRAFT") {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: "SENT", sentAt: new Date() },
        });
      }

      await tx.invoiceActivity.create({
        data: {
          invoiceId: invoice.id,
          action: "emailed",
          note: `Invoice emailed to ${invoice.billToEmail}`,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send invoice email failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to send invoice email";
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
