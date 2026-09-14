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

    // 1. Fetch the logged in user
    let user = await prisma.user.findUnique({
      where: { email },
      include: { studentProfile: true }
    });

    // Fallback: If not found in User, they might be in UserMode (from older schema)
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
      return NextResponse.json({ 
        success: false, 
        error: "No student profile found in the database. Please create one in the Admin mode." 
      }, { status: 404 });
    }

    // 2. Extract Details & Compute Class ID (e.g. 2nd year CSE A -> IICSEA)
    // Assuming semester 3 or 4 is Year II, etc.
    const semester = user.studentProfile.semester || 3; 
    let yearStr = "I";
    if (semester === 3 || semester === 4) yearStr = "II";
    if (semester === 5 || semester === 6) yearStr = "III";
    if (semester === 7 || semester === 8) yearStr = "IV";

    const department = user.studentProfile.department || "CSE";
    // We assume Section A by default since Section isn't in the schema yet
    const section = "A"; 
    const classId = `${yearStr}${department}${section}`; // e.g. "IICSEA"

    // 3. Set the Day Order based on explicit user instruction:
    // "start with tommorow as day order 4 so today day order 3"
    const currentDayOrder = "III"; // Today is Day Order 3
    const tomorrowDayOrder = "IV"; // Tomorrow is Day Order 4

    // 4. Fetch the timetable for the student's class and current day order
    let timetable: any[] = [];
    try {
      timetable = await prisma.$queryRaw`
        SELECT "id", "classId", "dayOrder", "period", "timeRange", "subjectCode", "subjectName", "facultyName", "roomNo"
        FROM "TimetableEntry"
        WHERE "classId" = ${classId} AND "dayOrder" = ${currentDayOrder}
        ORDER BY "period" ASC
      `;
    } catch (e) {
      console.error("Could not fetch timetable entries via raw query", e);
    }

    return NextResponse.json({
      success: true,
      data: {
        student: {
          name: user.name,
          vmNo: user.vmNo || user.studentProfile.rollNumber,
          department: department,
          semester: semester,
          section: section,
          classId: classId
        },
        currentDayOrder,
        tomorrowDayOrder,
        timetable
      }
    });

  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
