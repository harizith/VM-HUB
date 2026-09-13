import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "crypto";

// GET /api/admin/departments - Fetch departments
export async function GET() {
  try {
    // 1. Try standard Prisma ORM
    if ((prisma as any).department) {
      const departments = await (prisma as any).department.findMany({
        orderBy: { code: "asc" },
      });
      return NextResponse.json({ success: true, departments });
    }

    // 2. Direct raw SQL fallback if Prisma client generator was locked by Windows dev process
    const departments: any[] = await prisma.$queryRaw`
      SELECT id, code, name, "hodName" FROM "Department" ORDER BY code ASC
    `;

    return NextResponse.json({ success: true, departments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/admin/departments - Create new department
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, name, hodName } = body;

    if (!code || !name) {
      return NextResponse.json({ success: false, error: "Department Code and Name are required" }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();
    const cleanName = name.trim();
    const cleanHod = hodName ? hodName.trim() : null;

    // 1. Try standard Prisma ORM
    if ((prisma as any).department) {
      const existing = await (prisma as any).department.findUnique({
        where: { code: cleanCode },
      });

      if (existing) {
        return NextResponse.json({ success: false, error: `Department '${cleanCode}' already exists` }, { status: 400 });
      }

      const newDept = await (prisma as any).department.create({
        data: {
          code: cleanCode,
          name: cleanName,
          hodName: cleanHod,
        },
      });



      return NextResponse.json({ success: true, department: newDept });
    }

    // 2. Direct raw SQL fallback for creation
    const newId = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO "Department" (id, code, name, "hodName", "createdAt")
      VALUES (${newId}, ${cleanCode}, ${cleanName}, ${cleanHod}, NOW())
    `;

    const newDept = { id: newId, code: cleanCode, name: cleanName, hodName: cleanHod };

    return NextResponse.json({ success: true, department: newDept });
  } catch (error: any) {
    console.error("Error creating department:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create department" }, { status: 500 });
  }
}

// DELETE /api/admin/departments - Delete department
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deptId = searchParams.get("id");

    if (!deptId) {
      return NextResponse.json({ success: false, error: "Department ID required" }, { status: 400 });
    }

    if ((prisma as any).department) {
      await (prisma as any).department.delete({
        where: { id: deptId },
      });
      return NextResponse.json({ success: true, deletedId: deptId });
    }

    await prisma.$executeRaw`
      DELETE FROM "Department" WHERE id = ${deptId}
    `;

    return NextResponse.json({ success: true, deletedId: deptId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
