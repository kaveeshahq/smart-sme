import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Revenue growth
    const [thisMonthRevenue, lastMonthRevenue] = await Promise.all([
      prisma.sale.aggregate({
        where: { soldAt: { gte: thisMonth }, status: "COMPLETED" },
        _sum: { total: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: {
          soldAt: { gte: lastMonth, lte: lastMonthEnd },
          status: "COMPLETED",
        },
        _sum: { total: true },
        _count: true,
      }),
    ]);

    // Best selling products
    const bestSellers = await prisma.saleItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, total: true },
      _count: true,
      orderBy: { _sum: { quantity: "desc" } },
      take: 8,
    });

    const bestSellerDetails = await Promise.all(
      bestSellers.map(async (item) => {
        const product = await prisma.product.findUnique({
  where: { id: item.productId },
  select: {
    name: true,
    sku: true,
    sellingPrice: true,
    category: {
      select: { name: true },
    },
  },
});
return {
  productId: item.productId,
  name: product?.name || "Unknown",
  sku: product?.sku || "",
  quantitySold: item._sum.quantity || 0,
  revenue: Math.round(item._sum.total || 0),
  orders: item._count,
};
      })
    );

    // Customer growth (monthly new customers)
    const customerGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const count = await prisma.customer.count({
        where: { createdAt: { gte: mStart, lte: mEnd } },
      });
      customerGrowth.push({
        month: d.toLocaleString("default", { month: "short" }),
        customers: count,
      });
    }

    // Sales by payment method
    const paymentMethods = await prisma.sale.groupBy({
      by: ["paymentMethod"],
      where: { soldAt: { gte: sixMonthsAgo }, status: "COMPLETED" },
      _count: true,
      _sum: { total: true },
    });

    // Category revenue
    const categoryRevenue = await prisma.saleItem.findMany({
      where: {
        sale: { soldAt: { gte: sixMonthsAgo }, status: "COMPLETED" },
      },
      include: {
        product: { include: { category: true } },
      },
    });

    const catMap: Record<string, number> = {};
    for (const item of categoryRevenue) {
      const cat = item.product?.category?.name || "Uncategorized";
      catMap[cat] = (catMap[cat] || 0) + item.total;
    }
    const categoryData = Object.entries(catMap)
      .map(([name, revenue]) => ({ name, revenue: Math.round(revenue) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    // Low stock products
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true, name: true, sku: true,
        stockQty: true, lowStockAlert: true,
        category: { select: { name: true } },
      },
    });
    const lowStock = allProducts
      .filter((p) => p.stockQty <= p.lowStockAlert)
      .sort((a, b) => a.stockQty - b.stockQty)
      .slice(0, 8);

    // Revenue vs target (simple calculation)
    const thisRev = thisMonthRevenue._sum.total || 0;
    const lastRev = lastMonthRevenue._sum.total || 0;
    const revenueGrowth = lastRev > 0
      ? ((thisRev - lastRev) / lastRev) * 100
      : 0;

    const salesGrowth = lastMonthRevenue._count > 0
      ? ((thisMonthRevenue._count - lastMonthRevenue._count) / lastMonthRevenue._count) * 100
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          thisMonthRevenue: Math.round(thisRev),
          lastMonthRevenue: Math.round(lastRev),
          revenueGrowth: Math.round(revenueGrowth * 10) / 10,
          thisMonthSales: thisMonthRevenue._count,
          lastMonthSales: lastMonthRevenue._count,
          salesGrowth: Math.round(salesGrowth * 10) / 10,
        },
        bestSellers: bestSellerDetails,
        customerGrowth,
        paymentMethods: paymentMethods.map((p) => ({
          method: p.paymentMethod.replace("_", " "),
          count: p._count,
          revenue: Math.round(p._sum.total || 0),
        })),
        categoryData,
        lowStock,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}