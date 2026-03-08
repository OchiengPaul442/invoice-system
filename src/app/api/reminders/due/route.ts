import { addDays, startOfDay } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email";
import { buildInvoiceEmailContent, resolveSenderIdentity } from "@/lib/invoice-email";
import { prisma } from "@/lib/prisma";

type ReminderAction = "reminder_due_soon" | "reminder_overdue";

function resolveReminderAction(dueDate: Date, todayStart: Date): ReminderAction {
  if (dueDate < todayStart) {
    return "reminder_overdue";
  }
  return "reminder_due_soon";
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const cronSecret = process.env.REMINDERS_CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { success: false, error: "Missing REMINDERS_CRON_SECRET" },
      { status: 500 },
    );
  }

  const providedSecret = req.headers.get("x-reminder-secret");
  if (providedSecret !== cronSecret) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const appName = process.env.NEXT_PUBLIC_APP_NAME || "LedgerBloom";
    const todayStart = startOfDay(new Date());
    const upcomingWindowEnd = addDays(todayStart, 2);

    const candidateInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: ["SENT", "VIEWED", "PARTIAL", "OVERDUE"] },
        dueDate: { lte: upcomingWindowEnd },
        balanceDue: { gt: 0 },
      },
      select: {
        id: true,
        billToEmail: true,
        billToName: true,
        dueDate: true,
        invoiceNumber: true,
        currency: true,
        balanceDue: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                businessName: true,
                businessEmail: true,
                isFreelancer: true,
              },
            },
            invoiceSettings: {
              select: {
                sendCopyToSelf: true,
              },
            },
          },
        },
      },
      take: 500,
      orderBy: { dueDate: "asc" },
    });

    if (!candidateInvoices.length) {
      return NextResponse.json({ success: true, data: { checked: 0, sent: 0, skipped: 0 } });
    }

    const invoiceIds = candidateInvoices.map((invoice) => invoice.id);
    const existingToday = await prisma.invoiceActivity.findMany({
      where: {
        invoiceId: { in: invoiceIds },
        action: { in: ["reminder_due_soon", "reminder_overdue"] },
        createdAt: { gte: todayStart },
      },
      select: {
        invoiceId: true,
        action: true,
      },
    });

    const sentToday = new Set(existingToday.map((row) => `${row.invoiceId}:${row.action}`));

    let sent = 0;
    let skipped = 0;
    const failures: Array<{ invoiceId: string; reason: string }> = [];

    for (const invoice of candidateInvoices) {
      const action = resolveReminderAction(invoice.dueDate, todayStart);
      const dedupeKey = `${invoice.id}:${action}`;
      if (sentToday.has(dedupeKey)) {
        skipped += 1;
        continue;
      }

      const sender = resolveSenderIdentity({
        appName,
        userName: invoice.user.name,
        userEmail: invoice.user.email,
        isFreelancer: invoice.user.profile?.isFreelancer,
        businessName: invoice.user.profile?.businessName,
        businessEmail: invoice.user.profile?.businessEmail,
      });

      const content = buildInvoiceEmailContent({
        kind: action === "reminder_overdue" ? "overdue" : "due_soon",
        recipientName: invoice.billToName || "there",
        invoiceNumber: invoice.invoiceNumber,
        amountDue: Number(invoice.balanceDue),
        currency: invoice.currency,
        dueDate: invoice.dueDate,
        sender,
        includeAttachmentNote: false,
      });

      try {
        await sendTransactionalEmail({
          to: [invoice.billToEmail],
          cc:
            invoice.user.invoiceSettings?.sendCopyToSelf && invoice.user.email
              ? [invoice.user.email]
              : undefined,
          replyTo: sender.replyTo,
          subject: content.subject,
          html: content.html,
          text: content.text,
        });

        await prisma.invoiceActivity.create({
          data: {
            invoiceId: invoice.id,
            action,
            note:
              action === "reminder_overdue"
                ? `Overdue reminder sent to ${invoice.billToEmail}`
                : `Due-soon reminder sent to ${invoice.billToEmail}`,
          },
        });
        sent += 1;
      } catch (error) {
        const reason = error instanceof Error ? error.message : "Failed to send reminder";
        failures.push({ invoiceId: invoice.id, reason });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        checked: candidateInvoices.length,
        sent,
        skipped,
        failures,
      },
    });
  } catch (error) {
    console.error("Send due reminders failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send due reminders" },
      { status: 500 },
    );
  }
}
