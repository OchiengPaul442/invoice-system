import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateInvoicePdfBuffer, syncInvoicePdfToCloudinary } from "@/lib/invoice-pdf";
import { sendTransactionalEmail } from "@/lib/email";
import { buildInvoiceEmailContent, resolveSenderIdentity } from "@/lib/invoice-email";
import { prisma } from "@/lib/prisma";

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

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      customSubject?: string;
      customMessage?: string;
    };
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
        select: { businessName: true, businessEmail: true, isFreelancer: true },
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

    const sender = resolveSenderIdentity({
      appName,
      userName: session.user.name,
      userEmail: session.user.email,
      isFreelancer: profile?.isFreelancer,
      businessName: profile?.businessName,
      businessEmail: profile?.businessEmail,
    });
    const emailContent = buildInvoiceEmailContent({
      kind: "invoice",
      recipientName: refreshed.billToName || "there",
      invoiceNumber: refreshed.invoiceNumber,
      dueDate: refreshed.dueDate,
      amountDue: Number(refreshed.total),
      currency: refreshed.currency,
      sender,
      includeAttachmentNote: true,
      customMessage: body.customMessage,
      customSubject: body.customSubject,
    });
    let attachmentBuffer = await getCloudPdfAttachment(refreshed.pdfUrl);
    if (!attachmentBuffer) {
      const generated = await generateInvoicePdfBuffer(refreshed.id, refreshed.userId);
      attachmentBuffer = generated.buffer;
    }

    await sendTransactionalEmail({
      to: [refreshed.billToEmail],
      cc: settings?.sendCopyToSelf && session.user.email ? [session.user.email] : undefined,
      replyTo: sender.replyTo,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
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
