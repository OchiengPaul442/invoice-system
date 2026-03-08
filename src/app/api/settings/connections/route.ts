import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SUPPORTED_PROVIDERS = ["google", "github"] as const;
type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

function isSupportedProvider(value: string): value is SupportedProvider {
  return SUPPORTED_PROVIDERS.includes(value as SupportedProvider);
}

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const links = await prisma.userOauthConnection.findMany({
      where: { userId: session.user.id, provider: { in: [...SUPPORTED_PROVIDERS] } },
      select: { provider: true, providerEmail: true, updatedAt: true },
    });

    const byProvider = new Map(links.map((item) => [item.provider, item]));

    return NextResponse.json({
      success: true,
      data: {
        providers: {
          google: {
            available: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
            linked: Boolean(byProvider.get("google")),
            linkedEmail: byProvider.get("google")?.providerEmail || null,
            linkedAt: byProvider.get("google")?.updatedAt || null,
          },
          github: {
            available: Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET),
            linked: Boolean(byProvider.get("github")),
            linkedEmail: byProvider.get("github")?.providerEmail || null,
            linkedAt: byProvider.get("github")?.updatedAt || null,
          },
        },
      },
    });
  } catch (error) {
    console.error("Fetch auth connections failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch auth connections" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { provider?: string };
    if (!body.provider || !isSupportedProvider(body.provider)) {
      return NextResponse.json({ success: false, error: "Invalid provider" }, { status: 400 });
    }

    await prisma.userOauthConnection.deleteMany({
      where: { userId: session.user.id, provider: body.provider },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unlink provider failed:", error);
    return NextResponse.json({ success: false, error: "Failed to unlink provider" }, { status: 500 });
  }
}

