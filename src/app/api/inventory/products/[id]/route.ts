import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        supplier: true,
        stockMovements: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name, sku, description, categoryId, supplierId,
      costPrice, sellingPrice, stockQty, lowStockAlert, unit, isActive,
    } = body;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        sku,
        description,
        categoryId: categoryId ? parseInt(categoryId) : null,
        supplierId: supplierId ? parseInt(supplierId) : null,
        costPrice: parseFloat(costPrice) || 0,
        sellingPrice: parseFloat(sellingPrice),
        stockQty: parseInt(stockQty) || 0,
        lowStockAlert: parseInt(lowStockAlert) || 10,
        unit: unit || "pcs",
        isActive: isActive ?? true,
      },
      include: { category: true, supplier: true },
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
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
    await prisma.product.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Product deactivated",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}