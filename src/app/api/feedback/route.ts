import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendTransactionalEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { feedbackSchema } from "@/schemas/feedback.schema";

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const feedback = await prisma.feedback.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        category: true,
        subject: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: feedback });
  } catch (error) {
    console.error("Fetch feedback failed:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch feedback" }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as unknown;
    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.errors },
        { status: 400 },
      );
    }

    const entry = await prisma.feedback.create({
      data: {
        userId: session.user.id,
        category: parsed.data.category,
        subject: parsed.data.subject,
        message: parsed.data.message,
        contactEmail: parsed.data.contactEmail || null,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    const feedbackReceiver = process.env.FEEDBACK_RECEIVER_EMAIL || process.env.EMAIL_FROM;
    if (feedbackReceiver) {
      const appName = process.env.NEXT_PUBLIC_APP_NAME || "LedgerBloom";
      const actor = session.user.name || session.user.email || "Unknown user";
      const actorEmail = session.user.email || "unknown@local";
      const details = `
        New feedback received

        User: ${actor}
        Email: ${actorEmail}
        Category: ${parsed.data.category}
        Subject: ${parsed.data.subject}
        Contact: ${parsed.data.contactEmail || "Not provided"}

        Message:
        ${parsed.data.message}
      `.trim();

      try {
        await sendTransactionalEmail({
          to: [feedbackReceiver],
          subject: `[${appName}] Feedback: ${parsed.data.subject}`,
          text: details,
          html: `<pre style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap">${details}</pre>`,
          replyTo: parsed.data.contactEmail || actorEmail,
        });
      } catch (notifyError) {
        console.error("Feedback notification email failed:", notifyError);
      }
    }

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    console.error("Submit feedback failed:", error);
    return NextResponse.json({ success: false, error: "Failed to submit feedback" }, { status: 500 });
  }
}

