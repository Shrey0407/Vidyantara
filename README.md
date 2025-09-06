# विद्याntara - AI-Powered Learning Workspace

*विद्याntara* is a full-stack web application that leverages the Google Gemini API to transform study materials into a dynamic and interactive learning experience. Users can upload documents, images, or audio files to receive AI-generated summaries, take practice quizzes, and ask follow-up questions in a conversational chat interface, with support for multiple languages.

## Live Demo 🚀

You can access the live, deployed version of the application here:

**[https://vidyantara.vercel.app/](https://vidyantara.vercel.app/)**

## ✨ Features

  * *Multi-Format File Upload*: Supports PDF, image (PNG, JPG), and MP3 audio files.
  * *AI-Powered Summaries*: Generates concise, well-structured summaries of the uploaded content.
  * *Dynamic Quiz Generation*: Creates multiple-choice quizzes based on the document to test user knowledge.
  * *Interactive Chat*: A conversational AI tutor that answers follow-up questions with context from the original document.
  * *Multilingual Support*: Users can specify their preferred language for summaries and quizzes.
  * *Rich Text Rendering*: Correctly displays Markdown formatting and complex mathematical (LaTeX) formulas.

## 🛠 Tech Stack

### Frontend

  * *Framework*: Next.js 14 (App Router)
  * *UI Library*: React
  * *Styling*: Tailwind CSS
  * *Markdown Rendering*: react-markdown
  * *Math Rendering*: remark-math & rehype-katex

### Backend

  * *Framework*: Next.js API Routes
  * *AI*: Google Gemini API (@google/generative-ai)

### External Services

  * *3D Model*: Spline
  * *Hosting*: Vercel

