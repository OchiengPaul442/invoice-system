import { subMonths } from "date-fns";
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
    const userId = session.user.id;
    const sixMonthsAgo = subMonths(new Date(), 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
      totalInvoices,
      paidAgg,
      outstandingAgg,
      overdueCount,
      draftCount,
      recentInvoices,
      paidInvoicesLastSixMonths,
    ] = await Promise.all([
      prisma.invoice.count({ where: { userId } }),
      prisma.invoice.aggregate({
        where: { userId, status: "PAID" },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: { userId, status: { in: ["SENT", "OVERDUE", "PARTIAL"] } },
        _sum: { balanceDue: true },
      }),
      prisma.invoice.count({ where: { userId, status: "OVERDUE" } }),
      prisma.invoice.count({ where: { userId, status: "DRAFT" } }),
      prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.invoice.findMany({
        where: {
          userId,
          status: "PAID",
          paidAt: { gte: sixMonthsAgo },
        },
        select: { paidAt: true, total: true },
      }),
    ]);

    const monthlyMap = new Map<string, number>();
    for (let i = 0; i < 6; i += 1) {
      const monthDate = subMonths(new Date(), i);
      const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, 0);
    }

    paidInvoicesLastSixMonths.forEach((invoice) => {
      if (!invoice.paidAt) return;
      const key = `${invoice.paidAt.getFullYear()}-${String(invoice.paidAt.getMonth() + 1).padStart(2, "0")}`;
      const current = monthlyMap.get(key) ?? 0;
      monthlyMap.set(key, current + Number(invoice.total));
    });

    const monthlyRevenue = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, revenue]) => {
        const [year, month] = key.split("-");
        const date = new Date(Number(year), Number(month) - 1, 1);
        return {
          month: date.toLocaleString("en-US", { month: "short" }),
          revenue,
        };
      });

    return NextResponse.json({
      success: true,
      data: {
        totalInvoices,
        totalRevenue: Number(paidAgg._sum.total ?? 0),
        outstanding: Number(outstandingAgg._sum.balanceDue ?? 0),
        overdueCount,
        draftCount,
        recentInvoices,
        monthlyRevenue,
      },
    });
  } catch (error) {
    console.error("Fetch dashboard stats failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 },
    );
  }
}
