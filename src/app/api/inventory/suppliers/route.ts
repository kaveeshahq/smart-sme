import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({ success: true, data: suppliers });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, contactName, email, phone, address, city } =
      await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Supplier name is required" },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: { name, contactName, email, phone, address, city },
    });

    return NextResponse.json(
      { success: true, data: supplier },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create supplier" },
      { status: 500 }
    );
  }
}