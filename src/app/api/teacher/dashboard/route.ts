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

    const email = session.user.email;

    // 1. Fetch the logged in user
    let user = await prisma.user.findUnique({
      where: { email },
      include: { facultyProfile: true }
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
          facultyProfile: {
             department: "CSE",
             designation: "Assistant Professor",
             vmNo: um.vmno
          }
        } as any;
      }
    }

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "No teacher profile found in the database. Please create one in the Admin mode." 
      }, { status: 404 });
    }

    // 3. Compute Day Order dynamically
    const baseDate = new Date('2026-09-13T00:00:00'); // Base date was DO 3
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let current = new Date(baseDate);
    let weekdays = 0;
    while (current < today) {
        current.setDate(current.getDate() + 1);
        const day = current.getDay();
        if (day !== 0 && day !== 6) { 
            weekdays++;
        }
    }
    while (current > today) {
        current.setDate(current.getDate() - 1);
        const day = current.getDay();
        if (day !== 0 && day !== 6) { 
            weekdays--;
        }
    }

    const doIndex = (((2 + weekdays) % 5) + 5) % 5; 
    const doNumber = doIndex + 1;
    const roman = ["I", "II", "III", "IV", "V"];
    
    const currentDayOrder = roman[doNumber - 1]; 
    const tomorrowDayOrder = roman[doNumber % 5]; 

    // 4. Fetch the timetable for the teacher (all classes they teach today)
    // For simplicity, we try to match the user's name against the facultyName field
    let timetable: any[] = [];
    try {
      const searchParts = user.name.split(" ");
      // We just use the longest part of the name to search, or the first part
      const searchStr = searchParts.length > 1 ? searchParts[searchParts.length - 1] : user.name;
      
      timetable = await prisma.timetableEntry.findMany({
        where: {
          dayOrder: currentDayOrder,
          facultyName: {
            contains: searchStr,
            mode: "insensitive"
          }
        },
        orderBy: {
          period: "asc"
        }
      });
    } catch (e) {
      console.error("Could not fetch timetable entries", e);
    }

    return NextResponse.json({
      success: true,
      data: {
        teacher: {
          name: user.name,
          vmNo: user.vmNo || user.facultyProfile?.vmNo,
          department: user.facultyProfile?.department || "CSE",
          designation: user.facultyProfile?.designation || "Faculty"
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
