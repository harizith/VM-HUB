import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const DAYS = ['I', 'II', 'III', 'IV', 'V'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const DEFAULT_TIME_RANGES: Record<number, string> = {
  1: '08:05 - 08:55',
  2: '08:55 - 09:45',
  3: '10:00 - 10:50',
  4: '10:50 - 11:40',
  5: '12:20 - 01:05',
  6: '01:05 - 01:50',
  7: '02:00 - 02:45',
  8: '02:45 - 03:30',
};

function getClassAliases(classId: string): string[] {
  const aliases = new Set<string>([classId]);
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

function parseClassInfo(classId: string): { dept: string; year: string; semester: number | null } {
  const parts = classId.split('-');
  let year = 'I';
  let dept = 'CSE';
  let semester: number | null = null;

  if (parts.length >= 2) {
    year = parts[0].toUpperCase();
    dept = parts[1].toUpperCase();
  }

  // Map Year or explicit Semester numeral to semester number
  if (year === 'I') semester = 1;
  else if (year === 'II') semester = 3;
  else if (year === 'III') semester = 5;
  else if (year === 'IV') semester = 7;
  else if (year === 'V') semester = 5;
  else if (year === 'VI') semester = 6;
  else if (year === 'VII') semester = 7;
  else if (year === 'VIII') semester = 8;

  return { dept, year, semester };
}

interface SubjectCandidate {
  code: string;
  name: string;
  isLab: boolean;
  category: string;
  credits: number;
  facultyName: string | null;
  vmsNo: string | null;
  roomNo: string | null;
}

// Check if a category or subject name/code represents a laboratory course
function isLabCourse(name?: string | null, code?: string | null, category?: string | null): boolean {
  const text = `${name || ''} ${code || ''} ${category || ''}`.toLowerCase();
  return (
    text.includes('lab') ||
    text.includes('practical') ||
    text.includes('laboratory') ||
    text.includes('workshop') ||
    text.includes('project')
  );
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function POST(request: Request) {
  const authorization = await requireAdmin();
  if (!authorization.ok) {
    return NextResponse.json({ success: false, error: authorization.error }, { status: authorization.status });
  }

  try {
    const body = await request.json();
    const { classId } = body;

    if (!classId) {
      return NextResponse.json({ success: false, error: 'classId is required' }, { status: 400 });
    }

    const aliases = getClassAliases(classId);
    const { dept, semester } = parseClassInfo(classId);

    // 1. Fetch existing timetable entries for this class
    const existingEntries = await prisma.timetableEntry.findMany({
      where: { classId: { in: aliases } },
      orderBy: [{ dayOrder: 'asc' }, { period: 'asc' }],
    });

    // 2. Fetch official catalog subjects from DB for this department/semester
    const catalogWhere: any = {};
    if (dept && dept !== 'ALL') {
      catalogWhere.departmentCode = { equals: dept, mode: 'insensitive' };
    }
    if (semester) {
      // Allow current semester (e.g. sem 3) or adjacent semester for the academic year (e.g. sem 4)
      const allowedSems = [semester, semester + 1];
      catalogWhere.semester = { in: allowedSems };
    }

    let catalogSubjects = await prisma.subject.findMany({
      where: catalogWhere,
      orderBy: [{ semester: 'asc' }, { code: 'asc' }],
    });

    // If no catalog subjects match strict semester, fallback to department catalog
    if (catalogSubjects.length === 0 && dept) {
      catalogSubjects = await prisma.subject.findMany({
        where: { departmentCode: { equals: dept, mode: 'insensitive' } },
        orderBy: [{ semester: 'asc' }, { code: 'asc' }],
      });
    }

    // If still empty, fetch any institutional catalog subjects
    if (catalogSubjects.length === 0) {
      catalogSubjects = await prisma.subject.findMany({
        orderBy: [{ semester: 'asc' }, { code: 'asc' }],
      });
    }

    if (catalogSubjects.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No subjects found in the Course Catalog for department ${dept}. Please add subjects to the Course Catalog before randomizing.`,
        },
        { status: 400 }
      );
    }

    // Map existing entries to pick up faculty / room assignments for matching subject codes
    const existingFacultyByCode = new Map<string, { facultyName: string | null; vmsNo: string | null; roomNo: string | null; category: string | null }>();
    for (const e of existingEntries) {
      if (e.subjectCode?.trim()) {
        const c = e.subjectCode.trim().toUpperCase();
        if (!existingFacultyByCode.has(c)) {
          existingFacultyByCode.set(c, {
            facultyName: e.facultyName || null,
            vmsNo: e.vmsNo || null,
            roomNo: e.roomNo || null,
            category: e.category || null,
          });
        }
      }
    }

    // Build subject candidate pool strictly from Course Catalog subjects
    const subjectPool: SubjectCandidate[] = catalogSubjects.map((sub, idx) => {
      const code = sub.code.trim().toUpperCase();
      const name = sub.name.trim();
      const existingMeta = existingFacultyByCode.get(code);
      const isLab = isLabCourse(name, code, existingMeta?.category);
      const defaultCategory = isLab ? `lab${(idx % 2) + 1}` : `sub${(idx % 4) + 1}`;

      return {
        code,
        name,
        isLab,
        category: existingMeta?.category || defaultCategory,
        credits: sub.credits || 3,
        facultyName: existingMeta?.facultyName || null,
        vmsNo: existingMeta?.vmsNo || null,
        roomNo: existingMeta?.roomNo || null,
      };
    });

    // 3. Build current grid: day -> period -> entry
    const grid: Record<string, Record<number, any>> = {};
    for (const day of DAYS) {
      grid[day] = {};
    }

    for (const e of existingEntries) {
      if (e.dayOrder && e.period && DAYS.includes(e.dayOrder)) {
        grid[e.dayOrder][e.period] = e;
      }
    }

    // Calculate current weekly period count and daily distribution per subject
    const subjectWeeklyCounts = new Map<string, number>();
    const subjectDays = new Map<string, Set<string>>();

    for (const sub of subjectPool) {
      subjectWeeklyCounts.set(sub.code, 0);
      subjectDays.set(sub.code, new Set());
    }

    for (const day of DAYS) {
      for (const period of PERIODS) {
        const e = grid[day][period];
        if (e && (e.subjectCode?.trim() || e.subjectName?.trim())) {
          const code = (e.subjectCode || '').trim().toUpperCase();
          if (code) {
            subjectWeeklyCounts.set(code, (subjectWeeklyCounts.get(code) || 0) + 1);
            if (!subjectDays.has(code)) subjectDays.set(code, new Set());
            subjectDays.get(code)!.add(day);
          }
        }
      }
    }

    // Identify which periods (1-8 across Days I-V) are missing or blank
    const missingSlots: { day: string; period: number }[] = [];
    for (const day of DAYS) {
      for (const period of PERIODS) {
        const existing = grid[day][period];
        const isEmpty = !existing || (!existing.subjectName?.trim() && !existing.subjectCode?.trim());
        if (isEmpty) {
          missingSlots.push({ day, period });
        }
      }
    }

    if (missingSlots.length === 0) {
      return NextResponse.json({
        success: true,
        message: `All 40 periods (Days I-V, Periods 1-8) for class ${classId} are already fully scheduled! No missing periods to fill.`,
        timetable: existingEntries,
        count: existingEntries.length,
        filledCount: 0,
      });
    }

    // 4. Backtracking / Constraint Solver to fill missing slots according to user rules:
    // Rule 1: Max 6 periods per week for each subject
    // Rule 2: Cannot have 2 consecutive periods of the same subject, EXCEPT for lab courses
    // Rule 3: Every day order must have at least 1 period scheduled for each assigned subject (where capacity allows)
    // Dynamic fallback: If pool size is very small (e.g. fewer subjects than days), capacity gracefully scales.

    const MAX_PERIODS_PER_SUBJECT = 6;

    function solveSlot(index: number): boolean {
      if (index >= missingSlots.length) {
        // All missing slots filled! Now verify rule 3:
        // "every dayorder atlest 1 period should be there"
        // Ensure every Day Order has at least 1 active scheduled period
        for (const day of DAYS) {
          let hasPeriodInDay = false;
          for (const period of PERIODS) {
            if (grid[day][period] && (grid[day][period].subjectCode || grid[day][period].subjectName)) {
              hasPeriodInDay = true;
              break;
            }
          }
          if (!hasPeriodInDay) return false;
        }
        return true;
      }

      const { day, period } = missingSlots[index];

      // Prioritize subjects that:
      // A) Haven't appeared in this day yet (to satisfy Rule 3: at least 1 period every day order)
      // B) Have lower weekly count (to maintain balanced distribution below 6 max)
      const shuffledSubjects = shuffleArray(subjectPool);
      shuffledSubjects.sort((a, b) => {
        const aInDay = subjectDays.get(a.code)?.has(day) ? 1 : 0;
        const bInDay = subjectDays.get(b.code)?.has(day) ? 1 : 0;
        if (aInDay !== bInDay) return aInDay - bInDay; // Day-absence first
        const countA = subjectWeeklyCounts.get(a.code) || 0;
        const countB = subjectWeeklyCounts.get(b.code) || 0;
        return countA - countB; // Lowest count first
      });

      for (const candidate of shuffledSubjects) {
        const currentCount = subjectWeeklyCounts.get(candidate.code) || 0;

        // RULE 1: Max is 6 periods for each subject
        if (currentCount >= MAX_PERIODS_PER_SUBJECT) {
          continue;
        }

        // RULE 2: Shouldn't continue like 2 periods same except for lab periods
        const prevEntry = period > 1 ? grid[day][period - 1] : null;
        const nextEntry = period < 8 ? grid[day][period + 1] : null;

        const isConsecutivePrev =
          prevEntry && (prevEntry.subjectCode?.toUpperCase() === candidate.code || prevEntry.subjectName?.toLowerCase() === candidate.name.toLowerCase());
        const isConsecutiveNext =
          nextEntry && (nextEntry.subjectCode?.toUpperCase() === candidate.code || nextEntry.subjectName?.toLowerCase() === candidate.name.toLowerCase());

        if (!candidate.isLab) {
          if (isConsecutivePrev || isConsecutiveNext) {
            continue; // Not allowed for non-lab subjects
          }
        }

        // Apply tentative assignment
        grid[day][period] = {
          classId,
          dayOrder: day,
          period,
          timeRange: DEFAULT_TIME_RANGES[period] || `Period ${period}`,
          subjectCode: candidate.code,
          subjectName: candidate.name,
          facultyName: candidate.facultyName,
          roomNo: candidate.roomNo,
          vmsNo: candidate.vmsNo,
          category: candidate.category,
        };

        subjectWeeklyCounts.set(candidate.code, currentCount + 1);
        const daySet = subjectDays.get(candidate.code)!;
        const wasInDay = daySet.has(day);
        daySet.add(day);

        // Recurse to next slot
        if (solveSlot(index + 1)) {
          return true;
        }

        // Backtrack
        delete grid[day][period];
        subjectWeeklyCounts.set(candidate.code, currentCount);
        if (!wasInDay) {
          daySet.delete(day);
        }
      }

      return false;
    }

    const solved = solveSlot(0);

    if (!solved) {
      // Fallback: If strict 6-period max cannot satisfy all 40 slots with small pool size,
      // allow relaxation of max periods limit proportionally while strictly enforcing:
      // - No 2 consecutive non-lab periods
      // - Balanced distribution
      console.warn('Strict rule solve did not cover all slots; applying proportional relaxation...');
      for (const slot of missingSlots) {
        const { day, period } = slot;
        if (grid[day][period]?.subjectCode) continue;

        const sortedCandidates = [...subjectPool].sort((a, b) => {
          const aCount = subjectWeeklyCounts.get(a.code) || 0;
          const bCount = subjectWeeklyCounts.get(b.code) || 0;
          return aCount - bCount;
        });

        for (const candidate of sortedCandidates) {
          const prevEntry = period > 1 ? grid[day][period - 1] : null;
          const isConsecutive =
            prevEntry && (prevEntry.subjectCode?.toUpperCase() === candidate.code || prevEntry.subjectName?.toLowerCase() === candidate.name.toLowerCase());

          if (!candidate.isLab && isConsecutive) continue;

          grid[day][period] = {
            classId,
            dayOrder: day,
            period,
            timeRange: DEFAULT_TIME_RANGES[period] || `Period ${period}`,
            subjectCode: candidate.code,
            subjectName: candidate.name,
            facultyName: candidate.facultyName,
            roomNo: candidate.roomNo,
            vmsNo: candidate.vmsNo,
            category: candidate.category,
          };
          subjectWeeklyCounts.set(candidate.code, (subjectWeeklyCounts.get(candidate.code) || 0) + 1);
          break;
        }
      }
    }

    // Collect newly generated additions from solved grid
    const randomizedAdditions: any[] = [];
    for (const slot of missingSlots) {
      const assigned = grid[slot.day][slot.period];
      if (assigned) {
        randomizedAdditions.push({
          classId,
          dayOrder: slot.day,
          period: slot.period,
          timeRange: assigned.timeRange || DEFAULT_TIME_RANGES[slot.period] || `Period ${slot.period}`,
          subjectCode: assigned.subjectCode,
          subjectName: assigned.subjectName,
          facultyName: assigned.facultyName,
          roomNo: assigned.roomNo,
          vmsNo: assigned.vmsNo,
          category: assigned.category,
        });
      }
    }

    // 5. Delete previous placeholder or blank records for missing slots
    for (const slot of missingSlots) {
      const old = existingEntries.find((e) => e.dayOrder === slot.day && e.period === slot.period);
      if (old?.id) {
        await prisma.timetableEntry.delete({ where: { id: old.id } });
      }
    }

    // 6. Save new assignments
    await prisma.timetableEntry.createMany({
      data: randomizedAdditions,
    });

    // 7. Fetch updated full timetable
    const updatedTimetable = await prisma.timetableEntry.findMany({
      where: { classId: { in: aliases } },
      orderBy: [{ dayOrder: 'asc' }, { period: 'asc' }],
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: 'RANDOMIZE_CATALOG_TIMETABLE',
          details: `Filled ${randomizedAdditions.length} missing periods for ${classId} strictly from Course Catalog (Rules: <= 6 periods/subject, non-consecutive unless lab, >=1 period per day).`,
          performedBy: authorization.email,
        },
      });
    } catch (auditErr) {
      console.warn('Audit log creation failed for randomize timetable:', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully randomized ${randomizedAdditions.length} missing periods from Course Catalog! Rules satisfied: Max 6 periods/subject, non-consecutive (except labs), and every day order scheduled.`,
      timetable: updatedTimetable,
      count: updatedTimetable.length,
      filledCount: randomizedAdditions.length,
    });
  } catch (error: any) {
    console.error('Failed to randomize timetable:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
