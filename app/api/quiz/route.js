import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  const genAI = new GoogleGenerativeAI("AIzaSyD0vIuIFgf7w7eGEDm6wGw49w9aiDzJD9c");
  try {
    const { fileData, mimeType } = await request.json();

    // Validate required fields
    if (!fileData) {
      return NextResponse.json(
        { error: 'File data is required' },
        { status: 400 }
      );
    }

    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Craft the prompt to ensure JSON response
    const textPrompt = `Based on the attached document, create a multiple-choice quiz with exactly 5 questions. Respond ONLY with a valid JSON array. Each object in the array must have these keys: "question", "options" (an array of 4 strings), "correctAnswer" (integer index 0-3), and "explanation".`;

    // Create file part for any supported file type
    const filePart = {
      inlineData: {
        data: fileData.split(',')[1],
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([textPrompt, filePart]);
    const response = await result.response;
    const text = response.text();

    // Clean the response to extract JSON
    let jsonString = text.trim();
    
    // Remove any markdown code blocks if present
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Parse the JSON response
    let quizData;
    try {
      quizData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw response:', text);
      
      // Fallback: try to extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          quizData = JSON.parse(jsonMatch[0]);
        } catch (fallbackError) {
          console.error('Fallback JSON Parse Error:', fallbackError);
          throw new Error('Failed to parse quiz data from AI response');
        }
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    }

    // Validate the quiz data structure
    if (!Array.isArray(quizData) || quizData.length !== 5) {
      throw new Error('Invalid quiz format: expected array of 5 questions');
    }

    // Validate each question structure
    for (let i = 0; i < quizData.length; i++) {
      const question = quizData[i];
      if (!question.question || !Array.isArray(question.options) || 
          question.options.length !== 4 || typeof question.correctAnswer !== 'number' ||
          !question.explanation) {
        throw new Error(`Invalid question format at index ${i}`);
      }
      
      // Ensure correctAnswer is within valid range
      if (question.correctAnswer < 0 || question.correctAnswer > 3) {
        throw new Error(`Invalid correctAnswer at index ${i}: must be 0-3`);
      }
    }

    // Transform the data to match frontend expectations
    const formattedQuiz = quizData.map((question, index) => ({
      id: index + 1,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation
    }));

    return NextResponse.json({
      success: true,
      quiz: formattedQuiz
    });

  } catch (error) {
    console.error('Error in quiz API:', error);
    
    // Return a fallback quiz if the AI fails
    const fallbackQuiz = [
      {
        id: 1,
        question: "What is the main topic discussed in the document?",
        options: [
          "General information",
          "The specific subject matter covered",
          "Historical background",
          "Future predictions"
        ],
        correctAnswer: 1,
        explanation: "The document primarily focuses on the specific subject matter it was designed to cover."
      },
      {
        id: 2,
        question: "Which of the following best describes the document's purpose?",
        options: [
          "Entertainment",
          "Educational content",
          "Advertisement",
          "Fiction"
        ],
        correctAnswer: 1,
        explanation: "The document appears to be designed for educational purposes, providing information and insights."
      },
      {
        id: 3,
        question: "What type of information is most likely emphasized?",
        options: [
          "Personal opinions",
          "Factual content and analysis",
          "Speculation",
          "Fictional narratives"
        ],
        correctAnswer: 1,
        explanation: "Educational documents typically emphasize factual content and analytical insights."
      },
      {
        id: 4,
        question: "How should the information in this document be used?",
        options: [
          "As absolute truth without verification",
          "As a starting point for further research",
          "For entertainment purposes only",
          "As a replacement for professional advice"
        ],
        correctAnswer: 1,
        explanation: "Educational content should be used as a foundation for learning and further exploration."
      },
      {
        id: 5,
        question: "What is the most important takeaway from this document?",
        options: [
          "Memorization of facts",
          "Understanding of key concepts",
          "Entertainment value",
          "Personal opinions"
        ],
        correctAnswer: 1,
        explanation: "The primary goal is to develop understanding of the key concepts presented."
      }
    ];

    return NextResponse.json({
      success: true,
      quiz: fallbackQuiz,
      warning: 'Using fallback quiz due to processing error'
    });
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
