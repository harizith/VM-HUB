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
      include: { facultyProfile: true }
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
          facultyProfile: {
             department: "CSE",
             designation: "Faculty",
             vmNo: um.vmno
          }
        } as any;
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        vmNo: user.vmNo || (user.facultyProfile?.vmNo || ""),
        status: user.status,
        profile: {
          department: user.facultyProfile?.department || "CSE",
          designation: user.facultyProfile?.designation || "Faculty",
        }
      }
    });

  } catch (error: any) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const email = session.user.email;
    const body = await request.json();
    const { name, password } = body;

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (password) dataToUpdate.password = password;

    const umDataToUpdate: any = {};
    if (password) umDataToUpdate.password = password;

    if (Object.keys(dataToUpdate).length === 0) {
       return NextResponse.json({ success: true, message: "Nothing to update" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.update({
        where: { email },
        data: dataToUpdate
      });
    }

    const um = await prisma.userMode.findUnique({ where: { emailid: email } });
    if (um && Object.keys(umDataToUpdate).length > 0) {
      await prisma.userMode.update({
        where: { emailid: email },
        data: umDataToUpdate
      });
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error: any) {
    console.error("Profile API Update Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
