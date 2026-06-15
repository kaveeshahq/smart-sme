import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, approvedBy } = await request.json();

    const leave = await prisma.leave.update({
      where: { id: parseInt(id) },
      data: { status, approvedBy },
    });

    return NextResponse.json({ success: true, data: leave });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update leave" },
      { status: 500 }
    );
  }
}