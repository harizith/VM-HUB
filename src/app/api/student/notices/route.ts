import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    // Fetch all notices ordered by newest first
    const notices = await prisma.notice.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: notices
    });

  } catch (error: any) {
    console.error("Notices API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
