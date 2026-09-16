import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    // Fetch all users with role STUDENT
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT"
      },
      include: {
        studentProfile: true
      },
      orderBy: {
        name: "asc"
      }
    });

    return NextResponse.json({
      success: true,
      data: students
    });

  } catch (error: any) {
    console.error("Teacher Students API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
