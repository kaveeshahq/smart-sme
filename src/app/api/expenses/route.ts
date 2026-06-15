import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const search = searchParams.get("search") || "";

    const now = new Date();
    const m = month ? parseInt(month) : now.getMonth() + 1;
    const y = year ? parseInt(year) : now.getFullYear();

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const expenses = await prisma.expense.findMany({
      where: {
        date: { gte: start, lte: end },
        ...(category && { category }),
        ...(search && { title: { contains: search } }),
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, amount, category, description, date } = body;

    if (!title || !amount) {
      return NextResponse.json(
        { success: false, error: "Title and amount are required" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        amount: parseFloat(amount),
        category: category || "OTHER",
        description,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create expense" },
      { status: 500 }
    );
  }
}