/**
 * Utility to parse timetable tables from Word documents (.docx / .doc)
 * Uses mammoth to convert document tables and paragraphs to clean HTML/text,
 * extracts table rows under recognized timetable headers, and strictly ensures
 * no fabricated or guessed data is inserted (preserving data integrity).
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
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
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

  const html = result.value;
  const tables = parseTablesFromHtml(html);

  if (tables.length === 0) {
    // If no HTML tables found, inspect plain text lines as fallback
    const textResult = await mammoth.extractRawText({ buffer });
    const lines = textResult.value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const textRows = lines.map((l) => (l.includes("\t") ? l.split("\t") : l.split(/\s{2,}/)).map((c) => c.trim()));
    if (textRows.length > 0) {
      tables.push(textRows);
    }
  }

  const allSlots: ParsedDocTimetableSlot[] = [];

  for (const rows of tables) {
    let headers: string[] | null = null;
    let fieldIndexes: Record<string, number> = {};

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const cells = rows[rowIndex];

      // Check if this row is a header row
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

      const classId = get("classId");
      const rawDayOrder = get("dayOrder");
      const rawPeriod = get("period");
      const timeRange = get("timeRange");
      const subjectCode = get("subjectCode");
      const subjectName = get("subjectName");
      const facultyName = get("facultyName");
      const vmsNo = get("vmsNo");
      const roomNo = get("roomNo");
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
      "No timetable rows could be parsed from the Word document. Ensure the document contains a table with headers like: Class ID, Day Order, Period, Subject Code, Subject Name, Faculty Name, Room No."
    );
  }

  return { allSlots, warnings };
}
