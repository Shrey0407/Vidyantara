'use client';

import React from 'react';
import Link from 'next/link';
import SplineModel from '../components/SplineModel';

export default function Home() {
  return (
    <main className="min-h-screen bg-light-bg text-slate-900">
      {/* Sticky Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm border-b border-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Home Link */}
            <a 
              href="#home" 
              className="text-slate-900 font-semibold text-lg hover:text-blue-600 transition-all duration-300 hover:scale-105 hover:drop-shadow-lg hover:drop-shadow-blue-500/50"
            >
              Home
            </a>
            
            {/* Start Learning Button */}
            <Link href="/upload">
              <button className="px-6 py-2 border border-slate-600 hover:border-slate-700 text-slate-900 font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:bg-slate-200/50 hover:shadow-lg hover:shadow-slate-500/25">
                Start Learning
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Ultra Minimalistic with only 3D model */}
      <section id="home" className="min-h-screen bg-light-bg relative overflow-hidden">
        <div className="absolute inset-0">
          <SplineModel />
        </div>
        
        {/* Subtle scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-slate-600 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Introduction Section - Visible on scroll */}
      <section className="py-20 px-4 bg-light-bg">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 border border-blue-300 text-blue-700 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            Welcome to विद्याntara
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-blue-600 bg-clip-text text-transparent leading-tight">
            Accelerate Your Learning with AI
          </h1>

          {/* Sub-headline */}
          <p className="text-xl md:text-2xl text-slate-700 mb-12 max-w-4xl mx-auto leading-relaxed">
            Instantly transform any study material into summaries, quizzes, and content in your native language.
          </p>

          {/* Single CTA Button */}
          <div className="flex justify-center">
            <Link href="/upload">
              <button className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 text-lg">
                Start Learning
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-light-bg">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
              Unlock Your Potential with विद्याntara
            </h2>
            <p className="text-xl text-slate-700 max-w-3xl mx-auto">
              Our AI instantly repurposes your learning materials into multiple formats.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 - Smart Content Repurposing */}
            <div className="bg-white backdrop-blur-sm border border-slate-200 rounded-2xl p-8 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:transform hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Smart Content Repurposing</h3>
              <p className="text-slate-700 leading-relaxed">
                Automatically convert lectures, textbooks, and notes into concise summaries, flashcards, and study guides. Maximize retention, minimize effort.
              </p>
            </div>

            {/* Feature 2 - Global Language Support */}
            <div className="bg-white backdrop-blur-sm border border-slate-200 rounded-2xl p-8 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 hover:transform hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Global Language Support</h3>
              <p className="text-slate-700 leading-relaxed">
                Access your learning materials in over 50 regional languages. Break down language barriers and truly understand complex topics.
              </p>
            </div>

            {/* Feature 3 - Dynamic Quiz Generation */}
            <div className="bg-white backdrop-blur-sm border border-slate-200 rounded-2xl p-8 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:transform hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Dynamic Quiz Generation</h3>
              <p className="text-slate-700 leading-relaxed">
                Turn passive reading into active learning. Generate personalized, interactive quizzes and practice tests from any source material.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-light-bg border-t border-slate-300">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
            विद्याntara
          </h3>
          <p className="text-slate-600 mb-6">
            Accelerating learning with AI-powered content transformation
          </p>
          <div className="text-sm text-slate-500">
            © 2024 विद्याntara. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
