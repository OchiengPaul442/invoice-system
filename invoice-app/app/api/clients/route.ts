import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientCreateSchema } from "@/schemas/client.schema";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");

    const clients = await prisma.client.findMany({
      where: {
        userId: session.user.id,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { company: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(isActive !== null ? { isActive: isActive === "true" } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { invoices: true } },
      },
    });

    return NextResponse.json({ success: true, data: clients });
  } catch (error) {
    console.error("Fetch clients failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch clients" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body: unknown = await req.json();
    const parsed = clientCreateSchema.safeParse(body);
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

    const client = await prisma.client.create({
      data: {
        userId: session.user.id,
        ...parsed.data,
      },
    });

    return NextResponse.json({ success: true, data: client }, { status: 201 });
  } catch (error) {
    console.error("Create client failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create client" },
      { status: 500 },
    );
  }
}
