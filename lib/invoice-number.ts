import { prisma } from "@/lib/prisma";

export async function generateInvoiceNumber(userId: string): Promise<string> {
  const currentYear = new Date().getFullYear();

  const result = await prisma.$transaction(async (tx) => {
    const currentSettings = await tx.invoiceSettings.findUnique({
      where: { userId },
      select: { currentYear: true },
    });

    const settings = await tx.invoiceSettings.upsert({
      where: { userId },
      update: {
        currentSequence: {
          increment: currentYear === currentSettings?.currentYear ? 1 : 1,
        },
        currentYear,
      },
      create: {
        userId,
        currentSequence: 1,
        currentYear,
      },
    });

    if (settings.currentYear !== currentYear) {
      const reset = await tx.invoiceSettings.update({
        where: { userId },
        data: { currentSequence: 1, currentYear },
      });
      return reset;
    }

    return settings;
  });

  const prefix = result.invoicePrefix || "INV";
  const seq = String(result.currentSequence).padStart(4, "0");

  return `${prefix}-${currentYear}-${seq}`;
}
