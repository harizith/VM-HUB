import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ success: false, error: 'classId is required' }, { status: 400 });
    }

    const timetable = await prisma.timetableEntry.findMany({
      where: { classId },
      orderBy: [
        { dayOrder: 'asc' },
        { period: 'asc' }
      ]
    });

    return NextResponse.json({ success: true, timetable });
  } catch (error: any) {
    console.error('Failed to fetch timetable:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { classId, entries } = body;

    if (!classId || !entries || !Array.isArray(entries)) {
      return NextResponse.json({ success: false, error: 'classId and entries array are required' }, { status: 400 });
    }

    // Replace the entire timetable for the class
    await prisma.timetableEntry.deleteMany({
      where: { classId }
    });

    const inserted = await prisma.timetableEntry.createMany({
      data: entries.map((entry: any) => ({
        classId,
        dayOrder: entry.dayOrder,
        period: entry.period,
        timeRange: entry.timeRange || `Period ${entry.period}`,
        subjectCode: entry.subjectCode,
        subjectName: entry.subjectName,
        facultyName: entry.facultyName,
        roomNo: entry.roomNo
      }))
    });

    return NextResponse.json({ success: true, count: inserted.count });
  } catch (error: any) {
    console.error('Failed to update timetable:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
