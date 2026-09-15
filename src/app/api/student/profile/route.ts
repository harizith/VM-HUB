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

    const email = session.user.email;

    let user = await prisma.user.findUnique({
      where: { email },
      include: { studentProfile: true }
    });

    if (!user) {
      const um = await prisma.userMode.findUnique({ where: { emailid: email }});
      if (um) {
        user = {
          name: um.emailid.split("@")[0],
          vmNo: um.vmno,
          email: um.emailid,
          role: um.usermode.toUpperCase(),
          status: "ACTIVE",
          studentProfile: {
             department: "CSE",
             semester: 5,
             section: "A",
             batch: "2023-2027",
             rollNumber: um.vmno
          }
        } as any;
      }
    }

    if (!user || !user.studentProfile) {
      return NextResponse.json({ success: false, error: "Profile not found." }, { status: 404 });
    }

    // Determine year
    const sem = user.studentProfile.semester || 1;
    let year = "1st Year";
    if (sem === 3 || sem === 4) year = "2nd Year";
    if (sem === 5 || sem === 6) year = "3rd Year";
    if (sem === 7 || sem === 8) year = "4th Year";

    return NextResponse.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        vmNo: user.vmNo || user.studentProfile.rollNumber,
        status: user.status,
        profile: {
          department: user.studentProfile.department,
          semester: user.studentProfile.semester,
          section: "A", // Default for now until schema update
          batch: user.studentProfile.batch || "2023-2027",
          year: year
        }
      }
    });

  } catch (error: any) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
