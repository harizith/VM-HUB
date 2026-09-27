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
    const { query, attachedData } = await request.json();
    
    if (!query) {
      return NextResponse.json({ success: false, reply: 'No query provided.' }, { status: 400 });
    }

    let systemContent = `You are a fully autonomous AI assistant for a college administration system.
You have the ability to search, traverse, edit, update, and delete database records using the 'execute_sql' tool.
Here is the PostgreSQL database schema for the application:

${schemaStr}

Instructions:
1. Always adopt any specific tone requested by the user.
2. If the user asks to fetch or modify data, immediately use the 'execute_sql' tool.
3. Act like a helpful, conversational human chatbot. Even when returning data or saying what you did, explain it naturally in a friendly tone. Never sound like a robot or dump raw JSON unless explicitly asked.
4. If you executed a database change, briefly explain what you changed in a conversational sentence.`;

    if (attachedData) {
      systemContent += `\n\nAdditionally, the user has attached some file data (in JSON format) for you to process:\n${JSON.stringify(attachedData).substring(0, 50000)} // Truncated if too large\n\nIf the user asks you to import, insert, or process this data, write the appropriate SQL queries (like INSERT INTO "Subject" (...) VALUES ...) to process this attached data into the database.`;
    }

    const messages: any[] = [
      {
        role: 'system',
        content: systemContent
      },
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
      model: 'llama3-70b-8192',
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
          model: 'llama3-70b-8192'
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
    return NextResponse.json({ success: false, reply: 'An error occurred while processing your query.', data: error.message }, { status: 500 });
  }
}
