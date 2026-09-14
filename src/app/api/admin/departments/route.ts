import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/departments - Fetch departments
export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { code: "asc" },
    });

    return NextResponse.json({ success: true, departments });
  } catch (error: any) {
    console.error("Error fetching departments:", error);
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

    const existing = await prisma.department.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: `Department '${cleanCode}' already exists` }, { status: 400 });
    }

    const newDept = await prisma.department.create({
      data: {
        code: cleanCode,
        name: cleanName,
        hodName: cleanHod,
      },
    });

    return NextResponse.json({ 
      success: true, 
      department: newDept 
    });
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

    await prisma.department.delete({
      where: { id: deptId },
    });
    
    return NextResponse.json({ success: true, deletedId: deptId });
  } catch (error: any) {
    console.error("Error deleting department:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
