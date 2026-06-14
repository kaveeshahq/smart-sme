import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function GET() {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const sales = await prisma.sale.findMany({
      where: { soldAt: { gte: sixMonthsAgo }, status: "COMPLETED" },
      select: { soldAt: true, total: true },
      orderBy: { soldAt: "asc" },
    });

    const monthlyMap: Record<string, number> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = format(d, "MMM yyyy");
      monthlyMap[key] = 0;
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
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}