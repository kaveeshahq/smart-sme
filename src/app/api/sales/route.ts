import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoiceNo } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const sales = await prisma.sale.findMany({
      where: {
        ...(search && {
          OR: [
            { invoiceNo: { contains: search } },
            { customer: { firstName: { contains: search } } },
            { customer: { lastName: { contains: search } } },
          ],
        }),
        ...(status && { status }),
        ...(from && to && {
          soldAt: {
            gte: new Date(from),
            lte: new Date(to),
          },
        }),
      },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
      orderBy: { soldAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.sale.count({
      where: {
        ...(search && {
          OR: [
            { invoiceNo: { contains: search } },
            { customer: { firstName: { contains: search } } },
          ],
        }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({ success: true, data: sales, total });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, items, discount, tax, paymentMethod, note } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one item is required" },
        { status: 400 }
      );
    }

    // Validate stock availability
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }
      if (product.stockQty < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for ${product.name}. Available: ${product.stockQty}`,
          },
          { status: 400 }
        );
      }
    }

    const subtotal = items.reduce(
      (sum: number, item: { quantity: number; unitPrice: number; discount: number }) =>
        sum + item.quantity * item.unitPrice - (item.discount || 0),
      0
    );
    const discountAmt = parseFloat(discount) || 0;
    const taxAmt = parseFloat(tax) || 0;
    const total = subtotal - discountAmt + taxAmt;

    // Generate unique invoice number
    let invoiceNo = generateInvoiceNo();
    let existing = await prisma.sale.findUnique({ where: { invoiceNo } });
    while (existing) {
      invoiceNo = generateInvoiceNo();
      existing = await prisma.sale.findUnique({ where: { invoiceNo } });
    }

    // Create sale + update stock in transaction
    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          invoiceNo,
          customerId: customerId ? parseInt(customerId) : null,
          subtotal,
          discount: discountAmt,
          tax: taxAmt,
          total,
          paymentMethod: paymentMethod || "CASH",
          status: "COMPLETED",
          note,
          items: {
            create: items.map((item: {
              productId: number;
              quantity: number;
              unitPrice: number;
              discount: number;
            }) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount || 0,
              total: item.quantity * item.unitPrice - (item.discount || 0),
            })),
          },
        },
        include: { customer: true, items: { include: { product: true } } },
      });

      // Deduct stock for each item
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "OUT",
            quantity: item.quantity,
            reference: invoiceNo,
            note: `Sale: ${invoiceNo}`,
          },
        });
      }

      // Update customer loyalty points
      if (customerId) {
        await tx.customer.update({
          where: { id: parseInt(customerId) },
          data: { loyaltyPts: { increment: Math.floor(total / 100) } },
        });
      }

      return newSale;
    });

    return NextResponse.json({ success: true, data: sale }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to create sale" },
      { status: 500 }
    );
  }
}