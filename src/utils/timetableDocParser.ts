/**
 * Utility to parse timetable tables from Word documents (.docx / .doc)
 * Uses mammoth to convert document tables and paragraphs to clean HTML/text.
 * Supports:
 * 1. Traditional row-oriented table format (Class ID, Day Order, Period, Subject Code, Subject Name, Faculty Name, Room No).
 * 2. Visual Period Matrix Grid format (Day Order / DO in rows, Periods 1..8 in columns, matching official college PDF format).
 */

import mammoth from "mammoth";

export interface ParsedDocTimetableSlot {
  classId: string | null;
  dayOrder: string | null;
  period: number | null;
  timeRange: string | null;
  subjectCode: string | null;
  subjectName: string | null;
  facultyName: string | null;
  vmsNo?: string | null;
  roomNo: string | null;
  category?: string | null;
}

const DEFAULT_TIMINGS: Record<number, string> = {
  1: "08:05 - 08:55",
  2: "08:55 - 09:45",
  3: "10:00 - 10:50",
  4: "10:50 - 11:40",
  5: "12:20 - 01:05",
  6: "01:05 - 01:50",
  7: "02:00 - 02:45",
  8: "02:45 - 03:30",
};

const HEADER_ALIASES: Record<string, string[]> = {
  classId: ["class", "classid", "classidentifier", "section"],
  dayOrder: ["day", "dayorder", "day_order"],
  period: ["period", "slot", "periodno"],
  timeRange: ["time", "timerange", "timing", "time_range"],
  subjectCode: ["code", "subjectcode", "coursecode", "subject_code"],
  subjectName: ["subject", "subjectname", "coursename", "subject_name"],
  facultyName: ["faculty", "facultyname", "teacher", "teachername", "instructor", "faculty_name"],
  vmsNo: ["vmsno", "vmno", "staffid", "facultynumber", "mtsno", "vms_no"],
  roomNo: ["room", "roomno", "classroom", "room_no"],
  category: ["category", "subjectcategory", "subject_category", "type"],
};

const HEADER_BY_ALIAS = new Map(
  Object.entries(HEADER_ALIASES).flatMap(([field, aliases]) => aliases.map((alias) => [alias, field]))
);

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseDay(value: string | undefined | null): string | null {
  const raw = String(value ?? "").trim().toUpperCase().replace(/^DAY\s+/, "");
  if (!raw) return null;
  const numberToRoman: Record<string, string> = { "1": "I", "2": "II", "3": "III", "4": "IV", "5": "V" };
  const day = numberToRoman[raw] || raw;
  return ["I", "II", "III", "IV", "V"].includes(day) ? day : (value ? String(value).trim() : null);
}

function parsePeriod(value: string | undefined | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const match = raw.match(/\d+/);
  if (!match) return null;
  const period = Number.parseInt(match[0], 10);
  return period >= 1 && period <= 8 ? period : null;
}

function stripHtml(html: string): string {
  // Preserve paragraph and break boundaries with newlines so sub-elements (e.g. subject on line 1, class on line 2) are preserved
  return html
    .replace(/<\/p>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/**
 * Parses tables from HTML output produced by mammoth.
 */
function parseTablesFromHtml(html: string): string[][][] {
  const tables: string[][][] = [];
  const tableMatches = html.match(/<table[\s\S]*?<\/table>/gi) || [];

  for (const tableHtml of tableMatches) {
    const rows: string[][] = [];
    const trMatches = tableHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];

    for (const trHtml of trMatches) {
      const cells: string[] = [];
      const cellMatches = trHtml.match(/<(td|th)[\s\S]*?<\/(td|th)>/gi) || [];
      for (const cellHtml of cellMatches) {
        cells.push(stripHtml(cellHtml));
      }
      if (cells.length > 0) {
        rows.push(cells);
      }
    }

    if (rows.length > 0) {
      tables.push(rows);
    }
  }

  return tables;
}

/**
 * Parses faculty or class metadata and subject mappings from the document's text.
 */
function extractDocContext(text: string) {
  let facultyName: string | null = null;
  let vmsNo: string | null = null;
  let classId: string | null = null;
  let roomNo: string | null = null;

  const facultyMatch = text.match(/Name of the Faculty:\s*([^\n\r\t]+?)(?=\s+(?:MTS|Designation|Total|Department|Academic)|$)/i);
  if (facultyMatch) facultyName = facultyMatch[1].trim();

  const vmsMatch = text.match(/(?:MTS|VM|VMS)\s*No:?\s*([A-Za-z0-9]+)/i);
  if (vmsMatch) vmsNo = vmsMatch[1].trim();

  const classMatch = text.match(/Class ID:?\s*([A-Za-z0-9-]+)/i) || text.match(/Sem\/Sec:?\s*([A-Za-z0-9-]+)/i);
  if (classMatch) classId = classMatch[1].trim();

  const roomMatch = text.match(/Room\s*No:?\s*([A-Za-z0-9-]+)/i);
  if (roomMatch) roomNo = roomMatch[1].trim();

  // Subject details / course mapping lookup
  // e.g. "• Sub-1: 231CB721 - Software Project Management (SPM) | Sem/Sec: IV-CSE-A | Room: N-201"
  const subjectMap = new Map<string, { code: string; name: string; classId?: string; room?: string }>();
  const subjectLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  for (const line of subjectLines) {
    const lineUpper = line.toUpperCase();
    if (lineUpper.includes("SUB-") || lineUpper.includes("LAB-") || lineUpper.includes("PROJ-") || line.includes("•") || line.includes("*")) {
      const codeMatch = line.match(/\b([0-9]{3}[A-Z]{2,3}[0-9A-Z]{2,4}|[A-Z]{2,4}[0-9]{3,4})\b/);
      const code = codeMatch ? codeMatch[1].trim() : "";
      
      const parenMatch = line.match(/\(([A-Z0-9\s-]+)\)/);
      const alias = parenMatch ? parenMatch[1].trim() : "";

      // Match subject name after code or dash
      let name = "";
      const nameMatch = line.match(/(?:[-:]\s*(?:[0-9]{3}[A-Z]{2,3}[0-9A-Z]{2,4}\s*-\s*)?)(.+?)(?:\s*\([A-Z0-9\s-]+\)|\s*\||$)/);
      if (nameMatch) {
        name = nameMatch[1].replace(/^[0-9A-Z\s-]+:\s*/, "").replace(/^[0-9]{3}[A-Z]{2,3}[0-9A-Z]{2,4}\s*-\s*/, "").trim();
      }

      const secMatch = line.match(/(?:Sem\/Sec|Class):?\s*([A-Za-z0-9-]+)/i);
      const rowClass = secMatch ? secMatch[1].trim() : undefined;

      const rmMatch = line.match(/(?:Room|Bay):?\s*([A-Za-z0-9-\s]+?)(?:\||$)/i);
      const rowRoom = rmMatch ? rmMatch[1].trim() : undefined;

      if (alias) {
        subjectMap.set(alias.toUpperCase(), { code, name: name || alias, classId: rowClass, room: rowRoom });
      }
      if (code) {
        subjectMap.set(code.toUpperCase(), { code, name: name || code, classId: rowClass, room: rowRoom });
      }
    }
  }

  return { facultyName, vmsNo, classId, roomNo, subjectMap };
}

/**
 * Checks whether a table is an official PDF-style Period Grid Matrix:
 * e.g., Row 0 header contains "Day Order" and numbered periods (1..8).
 */
function isPeriodGridMatrix(rows: string[][]): {
  isGrid: boolean;
  periodColumns: { colIndex: number; period: number; timeRange?: string }[];
} {
  if (rows.length < 2) return { isGrid: false, periodColumns: [] };

  const firstRow = rows[0];
  const hasDayOrder = firstRow.some(c => {
    const norm = normalize(c);
    return norm.includes("dayorder") || norm === "do" || norm === "day";
  });

  const periodColumns: { colIndex: number; period: number; timeRange?: string }[] = [];

  for (let c = 0; c < firstRow.length; c++) {
    const text = firstRow[c];
    const match = text.match(/\b([1-8])\b/);
    if (match) {
      const p = parseInt(match[1], 10);
      const timeMatch = text.match(/(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/);
      periodColumns.push({
        colIndex: c,
        period: p,
        timeRange: timeMatch ? timeMatch[1].replace(/\s+/g, "") : DEFAULT_TIMINGS[p]
      });
    }
  }

  const isGrid = hasDayOrder && periodColumns.length >= 4;
  return { isGrid, periodColumns };
}

/**
 * Parses an official PDF-style grid from Word document table.
 */
function parseGridTable(
  rows: string[][],
  periodCols: { colIndex: number; period: number; timeRange?: string }[],
  context: ReturnType<typeof extractDocContext>
): ParsedDocTimetableSlot[] {
  const slots: ParsedDocTimetableSlot[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 0) continue;

    const dayText = row[0];
    const dayOrder = parseDay(dayText);
    if (!dayOrder) continue;

    for (const pCol of periodCols) {
      if (pCol.colIndex >= row.length) continue;
      const cell = row[pCol.colIndex]?.trim();
      if (!cell || cell === "-" || cell === "—" || cell.toUpperCase() === "LUNCH") continue;

      // Extract subject, section/class, room
      const lines = cell.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      let subjectToken = lines[0] || cell;
      let extraToken = lines[1] || "";

      // If everything was on a single line with space e.g. "PE-V IV-CSE-A"
      if (!extraToken && subjectToken.includes(" ")) {
        const parts = subjectToken.split(/\s+/);
        // Look for class pattern (e.g. IV-CSE-A or II-ECE-B)
        const classIdx = parts.findIndex(p => /^[I|V|X]+-[A-Z]+-[A-Z0-9]+$/i.test(p) || /^[A-Z0-9]+-[A-Z]+-[A-Z0-9]+$/i.test(p));
        if (classIdx > 0) {
          extraToken = parts.slice(classIdx).join(" ");
          subjectToken = parts.slice(0, classIdx).join(" ");
        }
      }

      let subjectCode: string | null = null;
      let subjectName: string | null = subjectToken;
      let slotClassId = context.classId;
      let slotRoom = context.roomNo;

      const mapping = context.subjectMap.get(subjectToken.toUpperCase());
      if (mapping) {
        if (mapping.code) subjectCode = mapping.code;
        if (mapping.name) subjectName = mapping.name;
        if (mapping.classId) slotClassId = mapping.classId;
        if (mapping.room) slotRoom = mapping.room;
      }

      if (extraToken) {
        if (/^[I|V|X]+-[A-Z]+-[A-Z0-9]+$/i.test(extraToken) || /^[A-Z0-9-]+$/.test(extraToken)) {
          slotClassId = extraToken;
        } else if (/^(?:Bay|LH|Lab|N-|LH-)/i.test(extraToken)) {
          slotRoom = extraToken;
        }
      }

      slots.push({
        classId: slotClassId || null,
        dayOrder,
        period: pCol.period,
        timeRange: pCol.timeRange || DEFAULT_TIMINGS[pCol.period] || null,
        subjectCode: subjectCode || subjectToken,
        subjectName: subjectName || subjectToken,
        facultyName: context.facultyName || null,
        vmsNo: context.vmsNo || undefined,
        roomNo: slotRoom || null,
        category: undefined,
      });
    }
  }

  return slots;
}

/**
 * Parses a Word document (.docx or .doc with standard XML packaging) buffer.
 */
export async function parseTimetableDocBuffer(buffer: Buffer): Promise<{
  allSlots: ParsedDocTimetableSlot[];
  warnings: string[];
}> {
  const warnings: string[] = [];

  let result: { value: string; messages: any[] };
  try {
    result = await mammoth.convertToHtml({ buffer });
  } catch (err: any) {
    throw new Error(
      `Failed to read Word document: ${err.message || "Invalid or encrypted document format"}`
    );
  }

  const rawTextResult = await mammoth.extractRawText({ buffer });
  const rawText = rawTextResult.value || "";
  const context = extractDocContext(rawText);

  const html = result.value;
  const tables = parseTablesFromHtml(html);

  if (tables.length === 0) {
    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const textRows = lines.map((l) => (l.includes("\t") ? l.split("\t") : l.split(/\s{2,}/)).map((c) => c.trim()));
    if (textRows.length > 0) {
      tables.push(textRows);
    }
  }

  const allSlots: ParsedDocTimetableSlot[] = [];

  for (const rows of tables) {
    // 1. Check if this table is the official PDF-style Period Grid Matrix
    const gridCheck = isPeriodGridMatrix(rows);
    if (gridCheck.isGrid) {
      const gridSlots = parseGridTable(rows, gridCheck.periodColumns, context);
      allSlots.push(...gridSlots);
      continue;
    }

    // 2. Otherwise parse as standard row-oriented list
    let headers: string[] | null = null;
    let fieldIndexes: Record<string, number> = {};

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const cells = rows[rowIndex];

      const mappedHeaders = cells.map((cell) => HEADER_BY_ALIAS.get(normalize(cell)));
      const recognizedCount = new Set(mappedHeaders.filter(Boolean)).size;

      if (recognizedCount >= 2) {
        headers = cells;
        fieldIndexes = {};
        cells.forEach((cell, index) => {
          const field = HEADER_BY_ALIAS.get(normalize(cell));
          if (field && fieldIndexes[field] === undefined) {
            fieldIndexes[field] = index;
          }
        });
        continue;
      }

      if (!headers) continue;

      const get = (key: string): string | null => {
        const idx = fieldIndexes[key];
        if (idx === undefined || idx >= cells.length) return null;
        const val = cells[idx]?.trim();
        return val || null;
      };

      const hasContent = cells.some((c) => c.trim() !== "");
      if (!hasContent) continue;

      const classId = get("classId") || context.classId;
      const rawDayOrder = get("dayOrder");
      const rawPeriod = get("period");
      const timeRange = get("timeRange");
      const subjectCode = get("subjectCode");
      const subjectName = get("subjectName");
      const facultyName = get("facultyName") || context.facultyName;
      const vmsNo = get("vmsNo") || context.vmsNo;
      const roomNo = get("roomNo") || context.roomNo;
      const category = get("category");

      const hasAnyField = [classId, rawDayOrder, rawPeriod, subjectCode, subjectName, facultyName, roomNo].some(Boolean);
      if (!hasAnyField) continue;

      const dayOrder = parseDay(rawDayOrder);
      const period = parsePeriod(rawPeriod);

      allSlots.push({
        classId,
        dayOrder: dayOrder || rawDayOrder,
        period,
        timeRange,
        subjectCode,
        subjectName,
        facultyName,
        vmsNo: vmsNo || undefined,
        roomNo,
        category: category ? category.toLowerCase() : undefined,
      });
    }
  }

  if (allSlots.length === 0) {
    throw new Error(
      "No timetable rows could be parsed from the Word document. Ensure the document contains an official period grid table (like the PDF template) or a table with columns: Class ID, Day Order, Period, Subject Code, Subject Name, Faculty Name, Room No."
    );
  }

  return { allSlots, warnings };
}
