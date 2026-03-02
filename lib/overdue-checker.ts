import { prisma } from "@/lib/prisma";

export async function markOverdueInvoices(userId: string): Promise<void> {
  await prisma.invoice.updateMany({
    where: {
      userId,
      status: "SENT",
      dueDate: { lt: new Date() },
    },
    data: { status: "OVERDUE" },
  });
}
