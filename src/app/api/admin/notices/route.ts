import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/notices
export async function GET() {
  try {
    const notices: any[] = await prisma.$queryRaw`
      SELECT id, title, content, category, "postedBy", "createdAt"
      FROM "Notice"
      ORDER BY "createdAt" DESC
    `;
    return NextResponse.json({ success: true, notices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/admin/notices
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, category } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: "Title and Content are required" }, { status: 400 });
    }

    const newId = crypto.randomUUID();
    const cat = category || "GENERAL";

    await prisma.$executeRaw`
      INSERT INTO "Notice" (id, title, content, category, "postedBy", "createdAt")
      VALUES (${newId}, ${title.trim()}, ${content.trim()}, ${cat}, 'Admin', NOW())
    `;

    return NextResponse.json({ success: true, notice: { id: newId, title, content, category: cat, postedBy: "Admin" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/notices
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });

    await prisma.$executeRaw`DELETE FROM "Notice" WHERE id = ${id}`;
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
