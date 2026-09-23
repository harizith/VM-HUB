import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { conflicts } = await request.json();
    
    if (!conflicts || !Array.isArray(conflicts)) {
      return NextResponse.json({ success: false, error: 'Conflicts array is required' }, { status: 400 });
    }

    let updatedCount = 0;

    for (const conflict of conflicts) {
      if (conflict.id && conflict.newData) {
        await prisma.timetableEntry.update({
          where: { id: conflict.id },
          data: {
            subjectCode: conflict.newData.subjectCode,
            subjectName: conflict.newData.subjectName,
            facultyName: conflict.newData.facultyName,
            roomNo: conflict.newData.roomNo,
            timeRange: conflict.newData.timeRange
          }
        });
        updatedCount++;
      }
    }

    return NextResponse.json({ success: true, count: updatedCount });

  } catch (error: any) {
    console.error('Confirmation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
