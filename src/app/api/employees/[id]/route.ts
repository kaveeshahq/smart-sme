import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { email: true, role: true } },
        attendances: { orderBy: { date: "desc" }, take: 30 },
        leaves: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch employee" },
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
      firstName, lastName, phone, address,
      nic, department, position, salary, isActive,
    } = body;

    const employee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: {
        firstName, lastName, phone, address,
        nic, department, position,
        salary: parseFloat(salary) || 0,
        isActive: isActive ?? true,
      },
      include: { user: { select: { email: true, role: true } } },
    });

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update employee" },
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
    await prisma.employee.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "Employee deactivated" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}