import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invoiceSettingsSchema } from "@/schemas/settings.schema";

export async function PUT(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body: unknown = await req.json();
    const parsed = invoiceSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.errors,
        },
        { status: 400 },
      );
    }

    const settings = await prisma.invoiceSettings.upsert({
      where: { userId: session.user.id },
      update: parsed.data,
      create: { userId: session.user.id, ...parsed.data },
    });

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Update invoice settings failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update invoice settings" },
      { status: 500 },
    );
  }
}
