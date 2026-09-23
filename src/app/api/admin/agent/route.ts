import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nlp from 'compromise';
// @ts-ignore
import compromiseNumbers from 'compromise-numbers';

// Extend compromise with numbers plugin
nlp.plugin(compromiseNumbers);

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ success: false, reply: 'No query provided.' }, { status: 400 });
    }

    const lowerQuery = query.toLowerCase();
    const doc = nlp(lowerQuery);

    // Identify Intent
    const isTimetable = doc.has('(timetable|schedule|classes|period)');
    const isFaculty = doc.has('(faculty|teacher|staff|professor|who)');
    const isSubject = doc.has('(subject|course)');
    const isStudent = doc.has('(student|user|person)');

    // Extract Entities
    const days = doc.match('#Date').out('array');
    const numsData = doc.numbers().get() as any[]; // [{ text: '1', number: 1 }]
    const people = doc.people().out('array');

    // Number extraction for period/day matching
    const numbers = numsData.map((n: any) => n.number);
    let periodFilter: number | undefined = undefined;
    
    // If the sentence mentions period and has a number, extract it
    if (doc.match('(period|hour)').found && numbers.length > 0) {
      periodFilter = numbers[0];
    } else if (numbers.length > 0 && !isTimetable) {
      // Just grab first number if any
      periodFilter = numbers[0];
    }

    // Day mapping
    const dayMapping: Record<string, string> = {
      monday: "I", tuesday: "II", wednesday: "III", thursday: "IV", friday: "V", saturday: "VI"
    };
    let dayOrder: string | undefined;
    for (const day of days) {
      const normalized = day.toLowerCase();
      if (dayMapping[normalized]) {
        dayOrder = dayMapping[normalized];
        break;
      }
    }

    // Class ID extraction
    let classIdFilter = "";
    const classMatch = lowerQuery.match(/\b(cse|it|ece|mech)\b/i);
    if (classMatch) {
      const cls = classMatch[1].toUpperCase();
      const secMatch = lowerQuery.match(/\b([a-d])\b/i);
      const sec = secMatch ? secMatch[1].toUpperCase() : '';
      classIdFilter = sec ? `${cls}-${sec}` : cls;
    }

    const ignoreWords = ['name', 'list', 'schedule', 'timetable', 'who', 'where', 'has', 'with', 'for', 'in', 'on', 'all', 'every', 'details', 'info', 'the', 'a', 'an'];

    // Faculty Name Extraction
    let nameQuery = "";
    if (people.length > 0) {
      nameQuery = people[0];
    } else if (isFaculty) {
      const letterMatch = lowerQuery.match(/(?:letter|starts with|ends with)\s+([a-z])\b/i);
      const nameMatch = doc.match('(faculty|teacher|staff|professor) .').terms(1).text();
      
      if (letterMatch) {
        nameQuery = letterMatch[1];
      } else if (nameMatch && nameMatch.length > 2 && !ignoreWords.includes(nameMatch)) {
        nameQuery = nameMatch;
      }
    }

    // Subject Extraction
    let subjectQuery = "";
    if (isSubject) {
      const subjMatch = doc.match('(subject|course) .').terms(1).text();
      if (subjMatch && subjMatch.length > 2 && !ignoreWords.includes(subjMatch)) {
        subjectQuery = subjMatch;
      }
    }

    // ============================================
    // ROUTING TO APPROPRIATE DATABASE QUERIES
    // ============================================

    // 1. TIMETABLE INTENT
    if (isTimetable || (classIdFilter && !isFaculty && !isStudent)) {
      const whereClause: any = {};
      if (classIdFilter) whereClause.classId = { contains: classIdFilter, mode: 'insensitive' };
      if (dayOrder) whereClause.dayOrder = dayOrder;
      if (periodFilter) whereClause.period = periodFilter;
      if (nameQuery) whereClause.facultyName = { contains: nameQuery, mode: 'insensitive' };

      const results = await prisma.timetableEntry.findMany({
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
        orderBy: [{ dayOrder: 'asc' }, { period: 'asc' }],
        take: 50
      });

      const conditions = [];
      if (classIdFilter) conditions.push(`class ${classIdFilter}`);
      if (dayOrder) conditions.push(`day ${dayOrder}`);
      if (periodFilter) conditions.push(`period ${periodFilter}`);
      if (nameQuery) conditions.push(`faculty ${nameQuery}`);
      
      const conditionStr = conditions.length > 0 ? ` for ${conditions.join(', ')}` : '';

      return NextResponse.json({
        success: true,
        reply: `Found ${results.length} timetable entries${conditionStr}.`,
        data: results
      });
    }

    // 2. FACULTY INTENT
    if (isFaculty) {
      // If we ask "who teaches CSE A", we should search timetable, not users
      if (classIdFilter || dayOrder || periodFilter) {
        const whereClause: any = {};
        if (classIdFilter) whereClause.classId = { contains: classIdFilter, mode: 'insensitive' };
        if (dayOrder) whereClause.dayOrder = dayOrder;
        if (periodFilter) whereClause.period = periodFilter;

        const results = await prisma.timetableEntry.findMany({
          where: whereClause,
          select: { facultyName: true, subjectName: true, classId: true, dayOrder: true, period: true },
          distinct: ['facultyName'],
          take: 20
        });

        return NextResponse.json({
          success: true,
          reply: `Found ${results.length} faculties matching that schedule criteria.`,
          data: results
        });
      }

      // Just searching for a faculty member
      const results = await prisma.user.findMany({
        where: {
          role: 'FACULTY',
          name: nameQuery ? { contains: nameQuery, mode: 'insensitive' } : undefined
        },
        select: { name: true, email: true, vmNo: true },
        take: 20
      });

      return NextResponse.json({
        success: true,
        reply: `Found ${results.length} faculty members${nameQuery ? ` matching '${nameQuery}'` : ''}.`,
        data: results
      });
    }

    // 3. SUBJECT INTENT
    if (isSubject || subjectQuery) {
      const results = await prisma.subject.findMany({
        where: subjectQuery ? {
          OR: [
            { name: { contains: subjectQuery, mode: 'insensitive' } },
            { code: { contains: subjectQuery, mode: 'insensitive' } }
          ]
        } : undefined,
        take: 20
      });

      return NextResponse.json({
        success: true,
        reply: `Found ${results.length} subjects${subjectQuery ? ` matching '${subjectQuery}'` : ''}.`,
        data: results
      });
    }

    // 4. STUDENT/USER INTENT
    if (isStudent) {
      const results = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: { name: true, email: true, role: true, vmNo: true },
        take: 10
      });
      return NextResponse.json({
        success: true,
        reply: `Here is a sample of students.`,
        data: results
      });
    }

    // 5. DYNAMIC SQL / MODEL FALLBACK (For unexpected queries)
    const modelMap: Record<string, string> = {
      'user': 'User', 'users': 'User', 'people': 'User', 
      'department': 'Department', 'departments': 'Department', 'dept': 'Department',
      'subject': 'Subject', 'subjects': 'Subject', 'course': 'Subject', 'courses': 'Subject',
      'notice': 'Notice', 'notices': 'Notice', 'announcement': 'Notice',
      'timetable': 'TimetableEntry', 'schedule': 'TimetableEntry'
    };

    let targetModel = "";
    const words = lowerQuery.replace(/[^\w\s]/g, '').split(' ');
    for (const word of words) {
      if (modelMap[word]) {
        targetModel = modelMap[word];
        break;
      }
    }

    if (targetModel) {
      const isCount = /count|how many|number of/.test(lowerQuery);
      
      // We found an unexpected model mention! Let's dynamically query it.
      const delegateName = targetModel.charAt(0).toLowerCase() + targetModel.slice(1);
      const prismaDelegate = (prisma as any)[delegateName];
      
      if (prismaDelegate) {
        let whereClause: any = undefined;
        let sqlWhere = "";
        
        // Advanced NLP: Detect "where X is Y" or "with X Y"
        const whereMatch = lowerQuery.match(/(?:where|with)\s+(\w+)\s+(?:is|equals|=)?\s*"?(\w+)"?/i);
        if (whereMatch) {
           const field = whereMatch[1];
           const value = whereMatch[2];
           
           // For Prisma, we'll try a generic string search (could fail on Ints, but good for local heuristic)
           whereClause = { [field]: { equals: value } };
           sqlWhere = ` WHERE "${field}" = '${value}'`;
        }

        try {
          if (isCount) {
            const count = await prismaDelegate.count({ where: whereClause });
            return NextResponse.json({
              success: true,
              reply: `Dynamically executed: SELECT COUNT(*) FROM "${targetModel}"${sqlWhere};\n\nResult: ${count}`,
              data: { count, sql: `SELECT COUNT(*) FROM "${targetModel}"${sqlWhere};` }
            });
          } else {
            const records = await prismaDelegate.findMany({ where: whereClause, take: 20 });
            return NextResponse.json({
              success: true,
              reply: `Dynamically executed: SELECT * FROM "${targetModel}"${sqlWhere} LIMIT 20;\n\n(Found ${records.length} records)`,
              data: records
            });
          }
        } catch (e: any) {
           // If the dynamic query fails (e.g. invalid field name), it will fall through to default
           console.error("Dynamic SQL heuristic failed:", e.message);
        }
      }
    }

    // DEFAULT RESPONSE
    return NextResponse.json({
      success: true,
      reply: "I couldn't quite extract the details from that. Try asking questions like 'Which teacher has CSE A on Monday morning?' or 'count users where role is FACULTY'.",
      data: { extracted: { days, numbers, people, classIdFilter, intent: "UNKNOWN" } }
    });

  } catch (error: any) {
    console.error('Agent error:', error);
    return NextResponse.json({ success: false, reply: 'An error occurred while processing your query.', data: error.message }, { status: 500 });
  }
}
