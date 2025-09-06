import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Google Generative AI client
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI("AIzaSyD0vIuIFgf7w7eGEDm6wGw49w9aiDzJD9c"); // <-- TEMPORARY TEST

export async function POST(request) {
  try {
    const { fileData, mimeType, language, chatHistory, isInitialAnalysis, userMessage } = await request.json();

    // Validate required fields
    if (!fileData) {
      return NextResponse.json(
        { error: 'File data is required' },
        { status: 400 }
      );
    }

    if (!language) {
      return NextResponse.json(
        { error: 'Language is required' },
        { status: 400 }
      );
    }

    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (isInitialAnalysis) {
            // Initial summary generation
            const textPrompt = `Act as an expert academic assistant. Your task is to analyze the attached document and create a high-quality, precise summary in the ${language} language.

The summary must be structured as follows:
1. **Key Concepts**: A bulleted list of the most critical concepts, terms, and definitions.
2. **Detailed Breakdown**: A more thorough explanation of the main arguments, findings, or steps presented in the document.
3. **Examples**: If applicable, include 1-2 key examples from the document to illustrate the concepts.

Use clear headings and markdown for formatting. Ensure any mathematical formulas are enclosed in single '$' for inline math or double '$$' for block math.`;

            // Create file part for any supported file type
            const filePart = {
              inlineData: {
                data: fileData.split(',')[1],
                mimeType: mimeType,
              },
            };

            const result = await model.generateContentStream([textPrompt, filePart]);
            
            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              if (chunkText) {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: chunkText, type: 'content' })}\n\n`));
              }
            }
          } else {
            // Follow-up chat with context
            const chat = model.startChat({
              history: chatHistory || []
            });

            // Send the user message to the chat
            const result = await chat.sendMessageStream(userMessage || fileData);
            
            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              if (chunkText) {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: chunkText, type: 'content' })}\n\n`));
              }
            }
          }

          // Send completion signal
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Error in streaming response:', error);
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error in analyze API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
