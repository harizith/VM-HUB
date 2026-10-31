import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

function getClassAliases(classId: string): string[] {
  const aliases = new Set<string>([classId]);
  
  // Bridge semester roman numerals to academic year roman numerals without cross-contamination:
  // "IV-CSE-A" <-> "VII-CSE-A" (4th Year = Sem 7/8)
  // "III-CSE-A" <-> "V-CSE-A" (3rd Year = Sem 5/6)
  // "II-CSE-A" (2nd Year = Sem 3/4)
  const parts = classId.split('-');
  if (parts.length >= 3) {
    const yearOrSem = parts[0].toUpperCase();
    const dept = parts[1];
    const sec = parts[2];

    if (yearOrSem === 'IV' || yearOrSem === 'VII' || yearOrSem === 'VIII') {
      aliases.add(`IV-${dept}-${sec}`);
      aliases.add(`VII-${dept}-${sec}`);
      aliases.add(`VIII-${dept}-${sec}`);
    } else if (yearOrSem === 'III' || yearOrSem === 'V' || yearOrSem === 'VI') {
      aliases.add(`III-${dept}-${sec}`);
      aliases.add(`V-${dept}-${sec}`);
      aliases.add(`VI-${dept}-${sec}`);
    } else if (yearOrSem === 'II') {
      aliases.add(`II-${dept}-${sec}`);
    } else if (yearOrSem === 'I') {
      aliases.add(`I-${dept}-${sec}`);
    }
  }

  return Array.from(aliases);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const facultyName = searchParams.get('facultyName');
    const listOptions = searchParams.get('list');
    const viewHistory = searchParams.get('history') === 'true';

    // Query historical snapshots for a class or all classes
    if (viewHistory) {
      const historyWhere: any = {};
      if (classId) {
        historyWhere.classId = { in: getClassAliases(classId) };
      }
      const historyEntries = await (prisma as any).timetableHistory.findMany({
        where: historyWhere,
        orderBy: [{ archivedAt: 'desc' }, { dayOrder: 'asc' }, { period: 'asc' }],
      });

      // Group by versionId for convenient viewing
      const versionsMap: Record<string, any> = {};
      for (const entry of historyEntries) {
        const vId = entry.versionId || 'legacy';
        if (!versionsMap[vId]) {
          versionsMap[vId] = {
            versionId: vId,
            classId: entry.classId,
            academicYear: entry.academicYear,
            semester: entry.semester,
            changeReason: entry.changeReason,
            archivedBy: entry.archivedBy,
            archivedAt: entry.archivedAt,
            entriesCount: 0,
            entries: [],
          };
        }
        versionsMap[vId].entriesCount += 1;
        versionsMap[vId].entries.push(entry);
      }

      const versions = Object.values(versionsMap);
      return NextResponse.json({ success: true, history: historyEntries, versions });
    }

    // Return available options (classes & faculty) for filter dropdowns
    if (listOptions === 'options' || (!classId && !facultyName)) {
      const distinctClasses = await prisma.timetableEntry.findMany({
        select: { classId: true },
        distinct: ['classId'],
        orderBy: { classId: 'asc' },
      });

      // 1. Fetch all registered faculty and HOD from user database
      const registeredTeachers = await prisma.user.findMany({
        where: { role: { in: ['FACULTY', 'HOD'] } },
        select: { name: true, vmNo: true },
        orderBy: { name: 'asc' },
      });

      // 2. Fetch distinct faculty strings from timetable entries
      const ttEntries = await prisma.timetableEntry.findMany({
        select: { facultyName: true, vmsNo: true },
        distinct: ['facultyName'],
      });

      // Canonical dictionary of lowercase names -> { name, vmsNo }
      const facultyMap = new Map<string, { name: string; vmsNo: string | null }>();

      // Register official users first
      for (const t of registeredTeachers) {
        if (!t.name) continue;
        const key = t.name.trim().toLowerCase();
        facultyMap.set(key, { name: t.name.trim(), vmsNo: t.vmNo || null });
      }

      // Deconstruct any multi-staff entries (like lab sessions) and add external trainers
      for (const entry of ttEntries) {
        if (!entry.facultyName) continue;
        const subNames = entry.facultyName.split(/[,/]+/).map((s) => s.trim()).filter(Boolean);
        const subVms = (entry.vmsNo || '').split(/[,/]+/).map((s) => s.trim()).filter(Boolean);

        subNames.forEach((n, idx) => {
          const key = n.toLowerCase();
          // Check if already in map by exact name
          if (!facultyMap.has(key)) {
            // Check if matches any existing user by partial comparison
            const existingKey = Array.from(facultyMap.keys()).find(k => {
              const cleanA = k.replace(/^(dr\.?|mr\.?|ms\.?|mrs\.?)\s+/i, '').trim();
              const cleanB = key.replace(/^(dr\.?|mr\.?|ms\.?|mrs\.?)\s+/i, '').trim();
              return cleanA === cleanB;
            });

            if (existingKey) {
              const item = facultyMap.get(existingKey)!;
              if (!item.vmsNo && subVms[idx]) {
                item.vmsNo = subVms[idx];
              }
            } else {
              facultyMap.set(key, {
                name: n,
                vmsNo: subVms[idx] || null,
              });
            }
          } else if (!facultyMap.get(key)!.vmsNo && subVms[idx]) {
            facultyMap.get(key)!.vmsNo = subVms[idx];
          }
        });
      }

      const sortedFaculty = Array.from(facultyMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      if (!classId && !facultyName) {
        return NextResponse.json({
          success: true,
          options: {
            classes: distinctClasses.map((c) => c.classId),
            faculty: sortedFaculty,
          },
        });
      }
    }

    let timetable: any[] = [];

    if (facultyName) {
      // Query by faculty name or vmsNo
      timetable = await prisma.timetableEntry.findMany({
        where: {
          OR: [
            { facultyName: { contains: facultyName.trim(), mode: 'insensitive' } },
            { vmsNo: { contains: facultyName.trim() } },
          ],
        },
        orderBy: [{ dayOrder: 'asc' }, { period: 'asc' }],
      });

      return NextResponse.json({ success: true, timetable, mode: 'faculty', facultyName });
    }

    if (classId) {
      const aliases = getClassAliases(classId);

      timetable = await prisma.timetableEntry.findMany({
        where: {
          classId: { in: aliases },
        },
        orderBy: [{ dayOrder: 'asc' }, { period: 'asc' }],
      });

      return NextResponse.json({ success: true, timetable, mode: 'class', classId, matchedAliases: aliases });
    }

    return NextResponse.json({ success: false, error: 'classId or facultyName is required' }, { status: 400 });
  } catch (error: any) {
    console.error('Failed to fetch timetable:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const authorization = await requireAdmin();
  if (!authorization.ok) {
    return NextResponse.json({ success: false, error: authorization.error }, { status: authorization.status });
  }

  try {
    const body = await request.json();
    const { classId, entries, academicYear, semester, changeReason } = body;

    if (!classId || !entries || !Array.isArray(entries)) {
      return NextResponse.json({ success: false, error: 'classId and entries array are required' }, { status: 400 });
    }

    const aliases = getClassAliases(classId);

    // 1. Fetch current existing entries to archive in history FIRST
    const existingEntries = await prisma.timetableEntry.findMany({
      where: { classId: { in: aliases } },
    });

    let historyArchivedCount = 0;
    if (existingEntries.length > 0) {
      const versionId = `arch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const reason = changeReason || 'Timetable Update (Year/Semester Transition or Revision)';
      const archBy = authorization.email || 'Admin';

      try {
        const histResult = await (prisma as any).timetableHistory.createMany({
          data: existingEntries.map((e: any) => ({
            versionId,
            classId: e.classId || classId,
            academicYear: academicYear || null,
            semester: typeof semester === 'number' ? semester : null,
            changeReason: reason,
            archivedBy: archBy,
            dayOrder: e.dayOrder,
            period: e.period,
            timeRange: e.timeRange,
            subjectCode: e.subjectCode,
            subjectName: e.subjectName,
            facultyName: e.facultyName,
            roomNo: e.roomNo,
            vmsNo: e.vmsNo,
            category: e.category,
            originalCreated: e.createdAt,
          })),
        });
        historyArchivedCount = histResult.count || existingEntries.length;
      } catch (histErr: any) {
        console.warn('Timetable history archival warning:', histErr?.message || histErr);
      }
    }

    // 2. Clear old master timetable entries
    await prisma.timetableEntry.deleteMany({
      where: { classId: { in: aliases } },
    });

    // 3. Store new updated timetable entries in master timetable
    const inserted = await prisma.timetableEntry.createMany({
      data: entries.map((entry: any) => ({
        classId,
        dayOrder: entry.dayOrder,
        period: entry.period,
        timeRange: entry.timeRange || null,
        subjectCode: entry.subjectCode || null,
        subjectName: entry.subjectName || null,
        facultyName: entry.facultyName || null,
        roomNo: entry.roomNo || null,
        vmsNo: typeof entry.vmsNo === 'string' ? entry.vmsNo.trim() || null : null,
        category: entry.category || null,
      })),
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: 'TIMETABLE_UPDATE_WITH_HISTORY',
          details: `Updated schedule for ${classId} (${inserted.count} periods active). Archived ${historyArchivedCount} previous periods to history.`,
          performedBy: authorization.email || 'Admin',
        },
      });
    } catch {
      // Audit log non-blocking
    }

    return NextResponse.json({ 
      success: true, 
      count: inserted.count, 
      historyArchived: historyArchivedCount 
    });
  } catch (error: any) {
    console.error('Failed to update timetable:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authorization = await requireAdmin();
  if (!authorization.ok) {
    return NextResponse.json({ success: false, error: authorization.error }, { status: authorization.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const facultyName = searchParams.get('facultyName');

    if (facultyName) {
      const deleted = await prisma.timetableEntry.deleteMany({
        where: { facultyName: { contains: facultyName.trim(), mode: 'insensitive' } },
      });
      return NextResponse.json({ success: true, count: deleted.count });
    }

    if (!classId) {
      return NextResponse.json({ success: false, error: 'classId or facultyName is required' }, { status: 400 });
    }

    const aliases = getClassAliases(classId);
    const deleted = await prisma.timetableEntry.deleteMany({
      where: { classId: { in: aliases } },
    });

    return NextResponse.json({ success: true, count: deleted.count });
  } catch (error: any) {
    console.error('Failed to delete timetable:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
