import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const schemaStr = `
model User {
  id String @id
  vmNo String? @unique
  email String @unique
  name String
  role String // STUDENT, FACULTY, HOD, ADMIN
}
model Department {
  id String @id
  code String @unique
  name String
  hodName String?
}
model Subject {
  id String @id
  code String @unique
  name String
  credits Int
  semester Int
  departmentCode String
}
model TimetableEntry {
  id String @id
  classId String // e.g. "IICSEA"
  dayOrder String // e.g. "I", "II", "III", "IV", "V"
  period Int
  timeRange String
  subjectCode String
  subjectName String
  facultyName String
  roomNo String
}
model Notice {
  id String @id
  title String
  content String
  category String
  postedBy String
}
`;

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ success: false, reply: 'No query provided.' }, { status: 400 });
    }

    const prompt1 = `
You are an AI assistant for a college administration system acting as an intelligent SQL generator.
Here is the PostgreSQL database schema for the application:

${schemaStr}

User Query: "${query}"

Instructions:
Determine if the user wants to read or write to the database. If so, generate the exact PostgreSQL query to execute.
Return ONLY a JSON object with:
- sqlQuery: The PostgreSQL query string (or null if no database action is needed). Use double quotes around table and column names where appropriate (e.g. "User", "TimetableEntry", "name", "role").
- isWrite: Boolean, true if the query modifies data (INSERT, UPDATE, DELETE).
- tone: Any specific tone requested by the user (e.g., "pirate", "formal", "friendly"). Default to "normal".

Example response:
{
  "sqlQuery": "SELECT * FROM \\"User\\" WHERE role = 'FACULTY' LIMIT 5;",
  "isWrite": false,
  "tone": "normal"
}
`;

    const completion1 = await groq.chat.completions.create({
      messages: [ { role: 'system', content: prompt1 } ],
      model: 'openai/gpt-oss-120b',
      temperature: 0,
      response_format: { type: 'json_object' }
    });

    const step1Content = completion1.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(step1Content);
    const { sqlQuery, isWrite, tone } = parsed;

    let dbResult: any = "No database action was executed.";
    let errorStr: string | null = null;
    
    if (sqlQuery) {
      try {
        if (isWrite) {
          const affected = await prisma.$executeRawUnsafe(sqlQuery);
          dbResult = `[Query executed successfully. Affected ${affected} rows]`;
        } else {
          const records = await prisma.$queryRawUnsafe(sqlQuery);
          dbResult = records;
        }
      } catch (err: any) {
        errorStr = err.message;
        dbResult = `Database error: ${errorStr}`;
        console.error("SQL Error:", errorStr, "Query:", sqlQuery);
      }
    }

    const prompt2 = `
You are a helpful college administration AI assistant.
User Query: "${query}"
Tone requested: ${tone || 'normal'}

Action Result: 
${JSON.stringify(dbResult, null, 2)}

Provide a natural language response back to the user addressing their query based on the Action Result. Adopt the requested tone perfectly. If there was a database error, politely inform them. Do not include raw JSON or SQL in the response to the user, just answer naturally.
`;

    const completion2 = await groq.chat.completions.create({
      messages: [ { role: 'system', content: prompt2 } ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.7
    });

    const finalReply = completion2.choices[0]?.message?.content || "I couldn't generate a response.";

    return NextResponse.json({
      success: !errorStr,
      reply: finalReply,
      data: { sqlQuery, isWrite, tone, dbResult }
    });

  } catch (error: any) {
    console.error('Agent error:', error);
    return NextResponse.json({ success: false, reply: 'An error occurred while processing your query.', data: error.message }, { status: 500 });
  }
}
