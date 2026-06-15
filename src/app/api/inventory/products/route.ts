import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");
    const lowStock = searchParams.get("lowStock") === "true";

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(search && {
          OR: [
            { name: { contains: search } },
            { sku: { contains: search } },
          ],
        }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
      },
      include: { category: true, supplier: true },
      orderBy: { createdAt: "desc" },
    });

    const filtered = lowStock
      ? products.filter((p) => p.stockQty <= p.lowStockAlert)
      : products;

    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, sku, description, categoryId, supplierId,
      costPrice, sellingPrice, stockQty, lowStockAlert, unit,
    } = body;

    if (!name || !sku || !sellingPrice) {
      return NextResponse.json(
        { success: false, error: "Name, SKU and selling price are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "SKU already exists" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
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
      },
      include: { category: true, supplier: true },
    });

    // Record stock movement if initial stock > 0
    if (product.stockQty > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: "IN",
          quantity: product.stockQty,
          reference: "INITIAL_STOCK",
          note: "Initial stock on product creation",
        },
      });
    }

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}