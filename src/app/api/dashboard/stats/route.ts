import { subMonths } from "date-fns";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { convertAmountWithUsdBase, getUsdExchangeRates } from "@/lib/exchange-rates";
import { markOverdueInvoices } from "@/lib/overdue-checker";
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
    await markOverdueInvoices(userId);

    const sixMonthsAgo = subMonths(new Date(), 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
      profile,
      invoiceSettings,
      totalInvoices,
      paidByCurrency,
      outstandingByCurrency,
      overdueCount,
      draftCount,
      recentInvoices,
      paidInvoicesLastSixMonths,
    ] = await Promise.all([
      prisma.userProfile.findUnique({
        where: { userId },
        select: { currency: true },
      }),
      prisma.invoiceSettings.findUnique({
        where: { userId },
        select: { defaultCurrency: true },
      }),
      prisma.invoice.count({ where: { userId } }),
      prisma.invoice.groupBy({
        by: ["currency"],
        where: { userId, status: "PAID" },
        _sum: { total: true },
      }),
      prisma.invoice.groupBy({
        by: ["currency"],
        where: { userId, status: { in: ["SENT", "OVERDUE", "PARTIAL"] } },
        _sum: { balanceDue: true },
      }),
      prisma.invoice.count({ where: { userId, status: "OVERDUE" } }),
      prisma.invoice.count({ where: { userId, status: "DRAFT" } }),
      prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          dueDate: true,
          billToName: true,
          total: true,
          currency: true,
        },
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

    const preferredCurrency =
      (profile?.currency || invoiceSettings?.defaultCurrency || "UGX").trim().toUpperCase();
    const usdRates = await getUsdExchangeRates();

    const totalRevenue = paidByCurrency.reduce((sum, row) => {
      const amount = Number(row._sum.total || 0);
      return (
        sum +
        convertAmountWithUsdBase({
          amount,
          fromCurrency: row.currency,
          toCurrency: preferredCurrency,
          usdRates,
        })
      );
    }, 0);

    const outstanding = outstandingByCurrency.reduce((sum, row) => {
      const amount = Number(row._sum.balanceDue || 0);
      return (
        sum +
        convertAmountWithUsdBase({
          amount,
          fromCurrency: row.currency,
          toCurrency: preferredCurrency,
          usdRates,
        })
      );
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        totalInvoices,
        totalRevenue,
        outstanding,
        overdueCount,
        draftCount,
        preferredCurrency,
        recentInvoices: recentInvoices.map((invoice) => ({
          ...invoice,
          total: Number(invoice.total),
        })),
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
