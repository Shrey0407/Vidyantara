import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'विद्याntara - AI-Powered Learning Platform',
  description: 'Accelerate your learning with AI. Instantly transform any study material into summaries, quizzes, and content in your native language.',
  keywords: 'AI, learning, education, content transformation, quizzes, localization, विद्याntara',
  authors: [{ name: 'विद्याntara Team' }],
  // The 'viewport' property has been moved from here...
}

// ...into this new, separate export for Next.js 14
export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
      </head>
      <body className={`${inter.className} antialiased bg-light-bg text-slate-900`}>
        {children}
      </body>
    </html>
  )
}