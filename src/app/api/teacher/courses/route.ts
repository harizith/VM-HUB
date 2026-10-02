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
      where: { email }
    });

    // Fallback: If not found in User, they might be in UserMode (from older schema)
    if (!user) {
      const um = await prisma.userMode.findUnique({ where: { emailid: email }});
      if (um) {
        user = {
          name: um.emailid.split("@")[0],
          vmNo: um.vmno,
          email: um.emailid,
        } as any;
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // 2. Fetch the timetable for the teacher to extract unique courses
    const searchStr = user.name.trim();
    
    const timetable = await prisma.timetableEntry.findMany({
      where: {
        facultyName: {
          contains: searchStr,
          mode: "insensitive"
        }
      }
    });

    // 3. Extract unique courses and classes
    const uniqueCoursesMap = new Map();

    timetable.forEach(entry => {
      // Create a unique key for each Subject + Class combination
      const key = `${entry.subjectCode}-${entry.classId}`;
      if (!uniqueCoursesMap.has(key)) {
        uniqueCoursesMap.set(key, {
          id: key,
          name: entry.subjectName,
          code: entry.subjectCode,
          class: entry.classId,
          // Generate a deterministic color based on the subject code
          color: "rgba(56, 189, 248, 0.1)", 
          iconColor: "var(--sky-blue)",
          students: Math.floor(Math.random() * 20) + 40, // Simulated student count since we don't have enrollment tables
          progress: Math.floor(Math.random() * 40) + 30, // Simulated syllabus progress
          nextClass: "Pending Scheduling" // Could be calculated by finding the next chronological period
        });
      }
    });

    // Determine color mappings dynamically for visual variety
    const colors = [
      { color: "rgba(56, 189, 248, 0.1)", iconColor: "var(--sky-blue)" },
      { color: "rgba(168, 85, 247, 0.1)", iconColor: "#a855f7" },
      { color: "rgba(34, 197, 94, 0.1)", iconColor: "#22c55e" },
      { color: "rgba(245, 158, 11, 0.1)", iconColor: "#f59e0b" },
    ];

    const courses = Array.from(uniqueCoursesMap.values()).map((course, index) => {
      const colorSet = colors[index % colors.length];
      return {
        ...course,
        ...colorSet
      };
    });

    return NextResponse.json({
      success: true,
      data: courses
    });

  } catch (error: any) {
    console.error("Courses API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
