import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { productId, type, quantity, reference, note } = await request.json();

    if (!productId || !type || !quantity) {
      return NextResponse.json(
        { success: false, error: "Product, type and quantity are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const qty = parseInt(quantity);
    let newStock = product.stockQty;

    if (type === "IN" || type === "RETURN") {
      newStock += qty;
    } else if (type === "OUT" || type === "ADJUSTMENT") {
      if (product.stockQty < qty) {
        return NextResponse.json(
          { success: false, error: "Insufficient stock" },
          { status: 400 }
        );
      }
      newStock -= qty;
    }

    const [movement] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          productId: parseInt(productId),
          type,
          quantity: qty,
          reference,
          note,
        },
      }),
      prisma.product.update({
        where: { id: parseInt(productId) },
        data: { stockQty: newStock },
      }),
    ]);

    return NextResponse.json({ success: true, data: movement });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to update stock" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    const movements = await prisma.stockMovement.findMany({
      where: productId ? { productId: parseInt(productId) } : {},
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, data: movements });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch movements" },
      { status: 500 }
    );
  }
}