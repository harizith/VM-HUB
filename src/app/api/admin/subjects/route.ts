import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/subjects
export async function GET() {
  try {
    const subjects: any[] = await prisma.$queryRaw`
      SELECT id, code, name, credits, semester, "departmentCode", "createdAt"
      FROM "Subject"
      ORDER BY code ASC
    `;
    return NextResponse.json({ success: true, subjects });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/admin/subjects
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, name, credits, semester, departmentCode } = body;

    if (!code || !name) {
      return NextResponse.json({ success: false, error: "Subject Code and Name are required" }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();
    const cleanName = name.trim();
    const numCredits = parseInt(credits) || 3;
    const numSem = parseInt(semester) || 1;
    const dept = (departmentCode || "CSE").toUpperCase().trim();

    // Check duplicate
    const existing: any[] = await prisma.$queryRaw`
      SELECT id FROM "Subject" WHERE code = ${cleanCode} LIMIT 1
    `;

    if (existing && existing.length > 0) {
      return NextResponse.json({ success: false, error: `Subject code '${cleanCode}' already exists.` }, { status: 400 });
    }

    const newId = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO "Subject" (id, code, name, credits, semester, "departmentCode", "createdAt")
      VALUES (${newId}, ${cleanCode}, ${cleanName}, ${numCredits}, ${numSem}, ${dept}, NOW())
    `;

    return NextResponse.json({ success: true, subject: { id: newId, code: cleanCode, name: cleanName, credits: numCredits, semester: numSem, departmentCode: dept } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/subjects
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });

    await prisma.$executeRaw`DELETE FROM "Subject" WHERE id = ${id}`;
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
