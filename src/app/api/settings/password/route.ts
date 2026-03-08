import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { passwordUpdateSchema } from "@/schemas/settings.schema";

export async function PUT(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: unknown = await req.json();
    const parsed = passwordUpdateSchema.safeParse(body);
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        password: true,
        oauthConnections: {
          select: { provider: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const hasCredentialsConnection = user.oauthConnections.some(
      (connection) => connection.provider === "credentials",
    );
    const hasOAuthConnection = user.oauthConnections.some(
      (connection) => connection.provider === "google" || connection.provider === "github",
    );

    const isOAuthOnlyAccount = !hasCredentialsConnection && hasOAuthConnection;
    if (!isOAuthOnlyAccount) {
      if (!parsed.data.currentPassword) {
        return NextResponse.json(
          { success: false, error: "Current password is required" },
          { status: 400 },
        );
      }

      if (!user.password) {
        return NextResponse.json(
          { success: false, error: "Password update is not available for this account" },
          { status: 400 },
        );
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        parsed.data.currentPassword,
        user.password,
      );
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect" },
          { status: 400 },
        );
      }
    }

    if (user.password) {
      const isSameAsCurrent = await bcrypt.compare(parsed.data.newPassword, user.password);
      if (isSameAsCurrent) {
        return NextResponse.json(
          { success: false, error: "New password must be different from the current password" },
          { status: 400 },
        );
      }
    }

    const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.userOauthConnection.upsert({
        where: {
          userId_provider: {
            userId: user.id,
            provider: "credentials",
          },
        },
        update: {
          providerAccountId: user.id,
          providerEmail: user.email,
        },
        create: {
          userId: user.id,
          provider: "credentials",
          providerAccountId: user.id,
          providerEmail: user.email,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        hasPassword: true,
      },
    });
  } catch (error) {
    console.error("Update password failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update password" },
      { status: 500 },
    );
  }
}
