const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType, AlignmentType, BorderStyle, ShadingType } = require('docx');

async function createDocxTemplate() {
  const tableBorder = {
    style: BorderStyle.SINGLE,
    size: 4,
    color: "CBD5E1",
  };

  const borders = {
    top: tableBorder,
    bottom: tableBorder,
    left: tableBorder,
    right: tableBorder,
    insideHorizontal: tableBorder,
    insideVertical: tableBorder,
  };

  const headers = [
    "Class ID",
    "Day Order",
    "Period",
    "Subject Code",
    "Subject Name",
    "Subject Category",
    "Faculty Name",
    "MTS No",
    "Room No",
    "Time Range"
  ];

  const sampleData = [
    ["II-CSE-A", "I", "1", "CS3351", "Digital Principles & System Design", "sub1", "Dr. R. Saravanan", "1944", "LH-201", "08:05 - 08:55"],
    ["II-CSE-A", "I", "2", "CS3352", "Foundations of Data Science", "sub2", "Ms. V. Vijayashanthi", "17433", "LH-201", "08:55 - 09:45"],
    ["II-CSE-A", "I", "3", "CS3391", "Object Oriented Programming", "lab1", "Mr. N. Insozhan", "1069", "LH-201", "10:00 - 10:50"],
    ["II-CSE-A", "I", "4", "CS3391", "Object Oriented Programming Lab", "lab1", "Mr. N. Insozhan", "1069", "LH-201", "10:50 - 11:40"],
    ["IV-CSE-B", "II", "1", "CS3701", "Cloud Computing & DevOps", "pe", "Dr. E. Mercy Beulah", "2103", "N-203", "08:05 - 08:55"],
    ["IV-CSE-B", "II", "2", "CS3702", "Artificial Intelligence & ML", "sub1", "Dr. M. Victor Jose", "1820", "N-203", "08:55 - 09:45"],
    ["IV-CSE-B", "II", "3", "CS3703", "Compiler Design", "sub2", "Ms. D. Parkavi", "2044", "N-203", "10:00 - 10:50"],
    ["IV-CSE-B", "II", "4", "CS3704", "Software Project Management", "pe", "Dr. M. Victor Jose", "1820", "N-203", "10:50 - 11:40"],
  ];

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: "1E40AF" },
      children: [
        new Paragraph({
          children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 18 })],
          alignment: AlignmentType.CENTER,
        })
      ],
      borders,
    })),
  });

  const dataRows = sampleData.map((row, rIdx) => new TableRow({
    children: row.map((cellText, cIdx) => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: rIdx % 2 === 0 ? "F8FAFC" : "FFFFFF" },
      children: [
        new Paragraph({
          children: [new TextRun({ text: cellText, size: 17 })],
          alignment: cIdx === 2 || cIdx === 1 ? AlignmentType.CENTER : AlignmentType.LEFT,
        })
      ],
      borders,
    })),
  }));

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 720, right: 720 },
          size: { orientation: "landscape" }
        }
      },
      children: [
        new Paragraph({
          text: "VEL TECH MULTI TECH - TIMETABLE IMPORT TEMPLATE",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Instructions: Fill in the timetable slots below. You can add more rows as needed. Column headers must remain unchanged.",
              italics: true,
              size: 18,
              color: "64748B"
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [headerRow, ...dataRows],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '..', 'public', 'templates', 'timetable-import-template.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('Generated timetable-import-template.docx successfully at', outPath, 'size:', buffer.length);
}

createDocxTemplate().catch(console.error);
