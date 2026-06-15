import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const supplier = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: body,
    });

    return NextResponse.json({ success: true, data: supplier });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update supplier" },
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
    await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "Supplier deactivated" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete supplier" },
      { status: 500 }
    );
  }
}