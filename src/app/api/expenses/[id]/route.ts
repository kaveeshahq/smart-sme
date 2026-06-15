import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const expense = await prisma.expense.update({
      where: { id: parseInt(id) },
      data: {
        title: body.title,
        amount: parseFloat(body.amount),
        category: body.category,
        description: body.description,
        date: body.date ? new Date(body.date) : undefined,
      },
    });

    return NextResponse.json({ success: true, data: expense });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.expense.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true, message: "Expense deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}