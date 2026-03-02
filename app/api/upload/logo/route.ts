import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getExtensionFromMimeType,
  isValidLogoSize,
  isValidLogoType,
} from "@/lib/upload";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("logo");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    if (!isValidLogoType(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type" },
        { status: 400 },
      );
    }

    if (!isValidLogoSize(file.size)) {
      return NextResponse.json(
        { success: false, error: "File too large (max 5MB)" },
        { status: 400 },
      );
    }

    const ext = getExtensionFromMimeType(file.type);
    const dir = path.join(process.cwd(), "public", "uploads", session.user.id);
    await mkdir(dir, { recursive: true });

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (profile?.logoPath) {
      try {
        await unlink(path.join(process.cwd(), "public", profile.logoPath));
      } catch {
        // Ignore if old file doesn't exist.
      }
    }

    const filename = `logo.${ext}`;
    const bytes = await file.arrayBuffer();
    await writeFile(path.join(dir, filename), Buffer.from(bytes));

    const logoPath = `/uploads/${session.user.id}/${filename}`;
    await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: { logoPath },
      create: { userId: session.user.id, logoPath },
    });

    return NextResponse.json({ success: true, data: { logoPath } });
  } catch (error) {
    console.error("Logo upload failed:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 },
    );
  }
}
