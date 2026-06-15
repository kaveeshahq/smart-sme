import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const now = new Date();
    const m = month ? parseInt(month) : now.getMonth() + 1;
    const y = year ? parseInt(year) : now.getFullYear();

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    // Monthly revenue
    const revenue = await prisma.sale.aggregate({
      where: { soldAt: { gte: start, lte: end }, status: "COMPLETED" },
      _sum: { total: true },
      _count: true,
    });

    // Monthly expenses
    const expenses = await prisma.expense.aggregate({
      where: { date: { gte: start, lte: end } },
      _sum: { amount: true },
      _count: true,
    });

    // Expense by category
    const expenseByCategory = await prisma.expense.groupBy({
      by: ["category"],
      where: { date: { gte: start, lte: end } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    });

    // Last 6 months P&L
    const monthlyPL = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const [rev, exp] = await Promise.all([
        prisma.sale.aggregate({
          where: { soldAt: { gte: mStart, lte: mEnd }, status: "COMPLETED" },
          _sum: { total: true },
        }),
        prisma.expense.aggregate({
          where: { date: { gte: mStart, lte: mEnd } },
          _sum: { amount: true },
        }),
      ]);

      monthlyPL.push({
        month: d.toLocaleString("default", { month: "short", year: "2-digit" }),
        revenue: Math.round(rev._sum.total || 0),
        expenses: Math.round(exp._sum.amount || 0),
        profit: Math.round((rev._sum.total || 0) - (exp._sum.amount || 0)),
      });
    }

    const totalRevenue = revenue._sum.total || 0;
    const totalExpenses = expenses._sum.amount || 0;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0
      ? Math.round((netProfit / totalRevenue) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        revenue: totalRevenue,
        revenueCount: revenue._count,
        expenses: totalExpenses,
        expensesCount: expenses._count,
        netProfit,
        profitMargin,
        expenseByCategory: expenseByCategory.map((e) => ({
          category: e.category,
          amount: Math.round(e._sum.amount || 0),
        })),
        monthlyPL,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}