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
    const classId = `${yearStr}${department}${section}`; // e.g. "IICSEC"

    // 3. Compute Day Order dynamically
    const baseDate = new Date('2026-09-13T00:00:00'); // Base date was DO 3
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let current = new Date(baseDate);
    let weekdays = 0;
    // Iterate to count weekdays between baseDate and today
    while (current < today) {
        current.setDate(current.getDate() + 1);
        const day = current.getDay();
        if (day !== 0 && day !== 6) { 
            weekdays++;
        }
    }
    // Handle past dates if server time is earlier than baseDate
    while (current > today) {
        current.setDate(current.getDate() - 1);
        const day = current.getDay();
        if (day !== 0 && day !== 6) { 
            weekdays--;
        }
    }

    // Mathematical modulo that handles negative numbers correctly
    const doIndex = (((2 + weekdays) % 5) + 5) % 5; 
    const doNumber = doIndex + 1;
    const roman = ["I", "II", "III", "IV", "V"];
    
    const currentDayOrder = roman[doNumber - 1]; 
    const tomorrowDayOrder = roman[doNumber % 5]; 

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
