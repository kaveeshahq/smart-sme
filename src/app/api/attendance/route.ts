import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const employeeId = searchParams.get("employeeId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let dateFilter = {};

    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      dateFilter = { date: { gte: d, lt: next } };
    } else if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0);
      dateFilter = { date: { gte: start, lte: end } };
    }

    const attendances = await prisma.attendance.findMany({
      where: {
        ...(employeeId && { employeeId: parseInt(employeeId) }),
        ...dateFilter,
      },
      include: {
        employee: {
          select: { firstName: true, lastName: true, department: true, position: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, data: attendances });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, date, checkIn, checkOut, status, note } = body;

    if (!employeeId || !date || !status) {
      return NextResponse.json(
        { success: false, error: "Employee, date and status are required" },
        { status: 400 }
      );
    }

    // Check if record already exists for this date
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId: parseInt(employeeId),
        date: {
          gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
        },
      },
    });

    if (existing) {
      // Update existing
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          checkIn: checkIn ? new Date(checkIn) : null,
          checkOut: checkOut ? new Date(checkOut) : null,
          status,
          note,
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: parseInt(employeeId),
        date: new Date(date),
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        status,
        note,
      },
    });

    return NextResponse.json({ success: true, data: attendance }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to record attendance" },
      { status: 500 }
    );
  }
}