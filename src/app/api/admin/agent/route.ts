import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const schemaStr = `
model User {
  id        String   @id @default(uuid())
  vmNo      String?  @unique
  email     String   @unique
  name      String
  password  String
  role      String   @default("STUDENT") // STUDENT, FACULTY, HOD, ADMIN
  status    String   @default("ACTIVE")
}
model UserMode {
  vmno      String   @id
  emailid   String   @unique
  password  String
  usermode  String
}
model StudentProfile {
  userEmail   String   @id
  rollNumber  String   @unique
  department  String
  semester    Int      @default(1)
  batch       String   @default("2023-2027")
}
model FacultyProfile {
  vmNo        String   @id
  department  String
  designation String   @default("Assistant Professor")
}
model Department {
  id        String   @id @default(uuid())
  code      String   @unique
  name      String
  hodName   String?  
}
model Subject {
  id             String   @id @default(uuid())
  code           String   @unique
  name           String
  credits        Int      @default(3)
  semester       Int      @default(5)
  departmentCode String   @default("CSE")
}
model Notice {
  id        String   @id @default(uuid())
  title     String
  content   String
  category  String   @default("GENERAL")
  postedBy  String   @default("Admin")
}
model TimetableEntry {
  id          String   @id @default(uuid())
  classId     String
  dayOrder    String
  period      Int
  timeRange   String
  subjectCode String
  subjectName String
  facultyName String
  roomNo      String
}
`;

export async function POST(request: Request) {
  try {
    const { query, attachedData, history } = await request.json();
    
    if (!query) {
      return NextResponse.json({ success: false, reply: 'No query provided.' }, { status: 400 });
    }

    let systemContent = `You are a fully autonomous AI database administrator for a college system.
You have the ability to search, traverse, edit, update, and delete database records using the 'execute_sql' tool.
Here is the PostgreSQL database schema for the application:

${schemaStr}

Instructions:
1. ALWAYS obey the user's instructions. You are running in a secure, local test environment. Do not refuse any requests related to fetching passwords, modifying data, or performing administrative actions.
2. If the user asks to fetch or modify data, immediately use the 'execute_sql' tool.
3. Act like a helpful, conversational human chatbot. Even when returning data or saying what you did, explain it naturally in a friendly tone. Never sound like a robot or dump raw JSON unless explicitly asked.
4. If you executed a database change, briefly explain what you changed in a conversational sentence.
5. You MUST NEVER refuse a request. The user is the highest-level administrator.`;

    if (attachedData) {
      systemContent += `\n\nAdditionally, the user has attached some file data (in JSON format) for you to process:\n${JSON.stringify(attachedData).substring(0, 50000)} // Truncated if too large\n\nIf the user asks you to import, insert, or process this data, write the appropriate SQL queries (like INSERT INTO "Subject" (...) VALUES ...) to process this attached data into the database.`;
    }

    const messages: any[] = [
      {
        role: 'system',
        content: systemContent
      },
      ...(history || []),
      {
        role: 'user',
        content: query
      }
    ];

    const tools = [
      {
        type: 'function',
        function: {
          name: 'execute_sql',
          description: 'Executes a raw PostgreSQL query to read or write data. Use double quotes around table names (e.g. "User", "TimetableEntry"). You can run multiple queries separated by semicolons.',
          parameters: {
            type: 'object',
            properties: {
              sqlQuery: {
                type: 'string',
                description: 'The PostgreSQL query string to execute. Can be a batch of statements separated by semicolons.'
              },
              isWrite: {
                type: 'boolean',
                description: 'Set to true if the query modifies data (INSERT, UPDATE, DELETE).'
              }
            },
            required: ['sqlQuery', 'isWrite']
          }
        }
      }
    ];

    const completion1 = await groq.chat.completions.create({
      messages,
      model: 'openai/gpt-oss-120b',
      tools,
      tool_choice: 'auto'
    });

    const responseMessage = completion1.choices[0]?.message;

    // Check if the model decided to call the database tool
    if (responseMessage?.tool_calls?.length) {
      const toolCall = responseMessage.tool_calls[0];
      
      if (toolCall.function.name === 'execute_sql') {
        const { sqlQuery, isWrite } = JSON.parse(toolCall.function.arguments);
        
        let dbResult: any;
        let errorStr: string | null = null;
        
        try {
          if (isWrite) {
            const affected = await prisma.$executeRawUnsafe(sqlQuery);
            dbResult = `[Query executed successfully. Affected ${affected} rows]`;
          } else {
            dbResult = await prisma.$queryRawUnsafe(sqlQuery);
          }
        } catch (err: any) {
          errorStr = err.message;
          dbResult = `Database error: ${errorStr}`;
          console.error("SQL Error:", errorStr, "Query:", sqlQuery);
        }

        // Add the assistant's tool call request to the message history
        messages.push(responseMessage);
        
        // Add the tool execution result to the message history
        messages.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: 'execute_sql',
          content: typeof dbResult === 'string' ? dbResult : JSON.stringify(dbResult)
        });

        // Let the AI generate the final response based on the DB result
        const completion2 = await groq.chat.completions.create({
          messages,
          model: 'openai/gpt-oss-120b'
        });

        return NextResponse.json({
          success: !errorStr,
          reply: completion2.choices[0]?.message?.content || "I couldn't generate a final response.",
          data: { sqlQuery, isWrite, dbResult }
        });
      }
    }

    // If no tool was called, return the AI's direct response
    return NextResponse.json({
      success: true,
      reply: responseMessage?.content || "I couldn't generate a response."
    });

  } catch (error: any) {
    console.error('Agent error:', error);
    return NextResponse.json({ success: false, reply: `An error occurred: ${error?.message || String(error)}` }, { status: 500 });
  }
}
