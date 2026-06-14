import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const expenses = await prisma.expense.groupBy({
      by: ["category"],
      where: { date: { gte: thisMonth } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    });

    const data = expenses.map((e) => ({
      category: e.category,
      amount: Math.round(e._sum.amount || 0),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}