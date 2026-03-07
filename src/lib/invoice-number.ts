import { prisma } from "@/lib/prisma";

export async function generateInvoiceNumber(userId: string): Promise<string> {
  const currentYear = new Date().getFullYear();

  const result = await prisma.$transaction(async (tx) => {
    const currentSettings = await tx.invoiceSettings.findUnique({
      where: { userId },
      select: { id: true, currentYear: true, currentSequence: true, invoicePrefix: true },
    });

    if (!currentSettings) {
      return tx.invoiceSettings.create({
        data: {
          userId,
          currentSequence: 1,
          currentYear,
        },
      });
    }

    if (currentSettings.currentYear !== currentYear) {
      return tx.invoiceSettings.update({
        where: { userId },
        data: { currentSequence: 1, currentYear },
      });
    }

    return tx.invoiceSettings.update({
      where: { userId },
      data: {
        currentSequence: { increment: 1 },
      },
    });
  });

  const prefix = result.invoicePrefix || "INV";
  const seq = String(result.currentSequence).padStart(4, "0");

  return `${prefix}-${currentYear}-${seq}`;
}
