import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function GET() {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const sales = await prisma.sale.findMany({
      where: { soldAt: { gte: sixMonthsAgo }, status: "COMPLETED" },
      select: { soldAt: true, total: true },
      orderBy: { soldAt: "asc" },
    });

    const monthlyMap: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyMap[format(d, "MMM yyyy")] = 0;
    }

    for (const sale of sales) {
      const key = format(new Date(sale.soldAt), "MMM yyyy");
      if (monthlyMap[key] !== undefined) {
        monthlyMap[key] += sale.total;
      }
    }

    const data = Object.entries(monthlyMap).map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed" },
      { status: 500 }
    );
  }
}