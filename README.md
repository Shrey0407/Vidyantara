# विद्याntara - AI-Powered Learning Platform

A modern, minimalistic landing page for विद्याntara, an AI-powered platform that transforms learning materials into multiple formats.

## Features

- **Ultra-minimalistic hero section** with 3D Spline model
- **Responsive design** with Tailwind CSS
- **Modern dark theme** with futuristic aesthetics
- **Smooth animations** and transitions
- **Content sections** visible on scroll

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Font**: Inter (Google Fonts)
- **3D Model**: Spline (embedded iframe)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/
│   └── SplineModel.js
├── public/
├── package.json
├── tailwind.config.js
└── next.config.js
```

## Design Features

- **Hero Section**: Full-screen 3D model with subtle scroll indicator
- **Introduction Section**: Welcome badge, headline, sub-headline, and CTA buttons
- **Features Section**: Three-column grid showcasing platform capabilities
- **Responsive**: Mobile-first design with smooth breakpoints
- **Accessibility**: Proper semantic HTML and ARIA labels

## Customization

The design uses a dark theme with blue accents. You can customize colors in `tailwind.config.js` and modify content in `app/page.js`.
