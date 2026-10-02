import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

function computeStudentClassId(studentProfile: any): string {
  if (!studentProfile) return "";
  const semester = studentProfile.semester || 3; 
  let yearStr = "I";
  if (semester === 3 || semester === 4) yearStr = "II";
  if (semester === 5 || semester === 6) yearStr = "III";
  if (semester === 7 || semester === 8) yearStr = "IV";

  let rawDept = studentProfile.department || "CSE";
  let department = rawDept;
  let section = "A";

  const secMatch = rawDept.match(/\(Sec\s+([A-Z])\)/i);
  if (secMatch) {
    section = secMatch[1].toUpperCase();
    department = rawDept.replace(/\s*\(Sec\s+[A-Z]\)\s*/i, "").trim();
  }
  
  const normalizedDept = department.replace(/^(B\.E\s+|B\.Tech\s+)/i, "").trim();
  return `${yearStr}-${normalizedDept}-${section}`;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const email = session.user.email;

    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      const um = await prisma.userMode.findUnique({ where: { emailid: email } });
      if (um) {
        user = { name: um.emailid.split("@")[0] } as any;
      }
    }

    const searchStr = user?.name?.trim() || "";

    // Find all unique classes this teacher teaches
    const teacherTimetable = await prisma.timetableEntry.findMany({
      where: {
        facultyName: {
          contains: searchStr,
          mode: "insensitive"
        }
      },
      select: {
        classId: true
      }
    });

    const teacherClasses = new Set(teacherTimetable.map(t => t.classId));

    // Fetch all users with role STUDENT
    const allStudents = await prisma.user.findMany({
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

    // Filter students to only include those in the teacher's classes
    const students = allStudents.filter(student => {
      // If the teacher has no timetable entries, maybe they shouldn't see anyone (or maybe everyone? let's stick to filtering)
      const classId = computeStudentClassId(student.studentProfile);
      return teacherClasses.has(classId);
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
