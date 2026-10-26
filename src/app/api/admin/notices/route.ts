import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/notices
export async function GET() {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, notices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/admin/notices
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, category, audience } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: "Title and Content are required" }, { status: 400 });
    }

    const cat = category || "GENERAL";
    const aud = audience || "ALL";

    const newNotice = await prisma.notice.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: cat,
        audience: aud,
        postedBy: "Admin",
      },
    });

    return NextResponse.json({ success: true, notice: newNotice });
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

    await prisma.notice.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

