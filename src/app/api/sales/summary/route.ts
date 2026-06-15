import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);

    const [today, thisMonth, thisYear, totalSales] = await Promise.all([
      prisma.sale.aggregate({
        where: { soldAt: { gte: todayStart }, status: "COMPLETED" },
        _sum: { total: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: { soldAt: { gte: thisMonthStart }, status: "COMPLETED" },
        _sum: { total: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: { soldAt: { gte: thisYearStart }, status: "COMPLETED" },
        _sum: { total: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: { status: "COMPLETED" },
        _sum: { total: true },
        _count: true,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        today: { total: today._sum.total || 0, count: today._count },
        thisMonth: { total: thisMonth._sum.total || 0, count: thisMonth._count },
        thisYear: { total: thisYear._sum.total || 0, count: thisYear._count },
        allTime: { total: totalSales._sum.total || 0, count: totalSales._count },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}