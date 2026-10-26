import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    // Fetch all notices visible to faculty & all staff
    const notices = await prisma.notice.findMany({
      where: {
        OR: [
          { audience: "ALL" },
          { audience: "FACULTY" },
          { audience: "HOD" }
        ]
      } as any,
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      success: true,
      data: notices
    });
  } catch (error: any) {
    console.error("Teacher Notices API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
