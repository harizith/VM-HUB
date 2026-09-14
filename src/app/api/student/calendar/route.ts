import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
          studentProfile: {
             department: "CSE",
             semester: 5,
             section: "A",
             rollNumber: um.vmno
          }
        } as any;
      }
    }

    if (!user || !user.studentProfile) {
      return NextResponse.json({ success: false, error: "No student profile found." }, { status: 404 });
    }

    const semester = user.studentProfile.semester || 3; 
    let yearStr = "I";
    if (semester === 3 || semester === 4) yearStr = "II";
    if (semester === 5 || semester === 6) yearStr = "III";
    if (semester === 7 || semester === 8) yearStr = "IV";

    let rawDept = user.studentProfile.department || "CSE";
    let department = rawDept;
    let section = "A";

    const secMatch = rawDept.match(/\(Sec\s+([A-Z])\)/i);
    if (secMatch) {
      section = secMatch[1].toUpperCase();
      department = rawDept.replace(/\s*\(Sec\s+[A-Z]\)\s*/i, "").trim();
    }
    const classId = `${yearStr}${department}${section}`;

    let fullTimetable: any[] = [];
    try {
      fullTimetable = await prisma.$queryRaw`
        SELECT "id", "classId", "dayOrder", "period", "timeRange", "subjectCode", "subjectName", "facultyName", "roomNo"
        FROM "TimetableEntry"
        WHERE "classId" = ${classId}
        ORDER BY "dayOrder" ASC, "period" ASC
      `;
    } catch (e) {
      console.error("Could not fetch timetable entries via raw query", e);
    }

    // Group by Day Order
    const grouped: Record<string, any[]> = {
      "I": [], "II": [], "III": [], "IV": [], "V": []
    };

    fullTimetable.forEach(entry => {
      if (grouped[entry.dayOrder]) {
        grouped[entry.dayOrder].push(entry);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        classId,
        timetable: grouped
      }
    });

  } catch (error: any) {
    console.error("Calendar API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
