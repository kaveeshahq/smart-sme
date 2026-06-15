import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const employeeId = searchParams.get("employeeId");

    const leaves = await prisma.leave.findMany({
      where: {
        ...(status && { status }),
        ...(employeeId && { employeeId: parseInt(employeeId) }),
      },
      include: {
        employee: {
          select: { firstName: true, lastName: true, department: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: leaves });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaves" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, type, startDate, endDate, reason } = body;

    if (!employeeId || !type || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    const leave = await prisma.leave.create({
      data: {
        employeeId: parseInt(employeeId),
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, data: leave }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create leave request" },
      { status: 500 }
    );
  }
}