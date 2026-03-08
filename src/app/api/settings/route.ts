import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const [user, profile, invoiceSettings, connections] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true },
      }),
      prisma.userProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.invoiceSettings.findUnique({ where: { userId: session.user.id } }),
      prisma.userOauthConnection.findMany({
        where: { userId: session.user.id },
        select: { provider: true },
      }),
    ]);

    const normalizedInvoiceSettings = invoiceSettings
      ? {
          ...invoiceSettings,
          defaultTaxRate: Number(invoiceSettings.defaultTaxRate),
        }
      : null;

    const hasCredentialsConnection = connections.some(
      (connection) => connection.provider === "credentials",
    );
    const oauthProviders = connections
      .filter((connection) => connection.provider === "google" || connection.provider === "github")
      .map((connection) => connection.provider);
    const hasPassword = hasCredentialsConnection || oauthProviders.length === 0;

    return NextResponse.json({
      success: true,
      data: {
        user,
        profile,
        invoiceSettings: normalizedInvoiceSettings,
        security: {
          hasPassword,
          oauthProviders,
        },
      },
    });
  } catch (error) {
    console.error("Fetch settings failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}
