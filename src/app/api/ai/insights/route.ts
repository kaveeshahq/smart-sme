import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gemini, GEMINI_MODEL } from "@/lib/gemini";

export async function GET() {
  try {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      thisMonthSales,
      lastMonthSales,
      thisMonthExpenses,
      lowStockProducts,
      topProducts,
      recentSales,
      newCustomersThisWeek,
      pendingLeaves,
    ] = await Promise.all([
      prisma.sale.aggregate({
        where: { soldAt: { gte: thisMonth }, status: "COMPLETED" },
        _sum: { total: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: { soldAt: { gte: lastMonth, lte: lastMonthEnd }, status: "COMPLETED" },
        _sum: { total: true },
        _count: true,
      }),
      prisma.expense.aggregate({
        where: { date: { gte: thisMonth } },
        _sum: { amount: true },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { name: true, stockQty: true, lowStockAlert: true },
      }),
      prisma.saleItem.groupBy({
        by: ["productId"],
        where: { sale: { soldAt: { gte: sevenDaysAgo }, status: "COMPLETED" } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 3,
      }),
      prisma.sale.findMany({
        where: { soldAt: { gte: sevenDaysAgo }, status: "COMPLETED" },
        select: { total: true, soldAt: true },
      }),
      prisma.customer.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.leave.count({ where: { status: "PENDING" } }),
    ]);

    const lowStock = lowStockProducts.filter((p) => p.stockQty <= p.lowStockAlert);

    const topProductNames = await Promise.all(
      topProducts.map(async (tp) => {
        const product = await prisma.product.findUnique({
          where: { id: tp.productId },
          select: { name: true },
        });
        return { name: product?.name || "Unknown", qty: tp._sum.quantity || 0 };
      })
    );

    const revenueThisMonth = thisMonthSales._sum.total || 0;
    const revenueLastMonth = lastMonthSales._sum.total || 0;
    const revenueGrowth = revenueLastMonth > 0
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
      : 0;
    const expensesThisMonth = thisMonthExpenses._sum.amount || 0;
    const netProfit = revenueThisMonth - expensesThisMonth;
    const last7DaysRevenue = recentSales.reduce((s, sale) => s + sale.total, 0);

    const businessData = {
      revenueThisMonth,
      revenueLastMonth,
      revenueGrowthPct: Math.round(revenueGrowth * 10) / 10,
      salesCountThisMonth: thisMonthSales._count,
      expensesThisMonth,
      netProfit,
      last7DaysRevenue,
      newCustomersThisWeek,
      pendingLeaveRequests: pendingLeaves,
      lowStockItems: lowStock.map((p) => ({ name: p.name, stock: p.stockQty, threshold: p.lowStockAlert })),
      topSellingProductsLast7Days: topProductNames,
    };

    const prompt = `You are a business analyst for a Sri Lankan SME. Based on this real business data (currency is LKR), write a short, plain-English summary (3-5 sentences) of how the business is doing right now. Be specific with numbers. Mention anything that needs attention (low stock, pending leaves, slow sales) and anything positive. Don't use markdown headers, just flowing sentences. Don't repeat raw JSON back. Speak directly to the business owner.

Business data:
${JSON.stringify(businessData, null, 2)}`;

    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const insight = response.text || "No insights available.";

    return NextResponse.json({
      success: true,
      data: { insight, stats: businessData },
    });
  } catch (error) {
    console.error("AI Insights error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}