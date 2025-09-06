'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function UploadPage() {
  // File upload states
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  
  // Analysis states
  const [language, setLanguage] = useState('');
  const [currentView, setCurrentView] = useState('uploading'); // 'uploading', 'loading', 'results_ready', 'quiz', 'quiz_results'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Chat states
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [summaryContent, setSummaryContent] = useState('');
  const [fileData, setFileData] = useState(null);
  const [mimeType, setMimeType] = useState(null);
  
  // Quiz states
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    // Check file type
    const allowedTypes = ['image/', 'application/pdf', 'audio/mpeg'];
    const isValidType = allowedTypes.some(type => file.type.startsWith(type));
    
    if (isValidType) {
      setUploadedFile(file);
    } else {
      alert('Please upload a valid file type: Images, PDF, or MP3 audio files.');
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      // Read as dataURL for all supported file types (images, PDFs, MP3s)
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (uploadedFile && language.trim()) {
      setIsAnalyzing(true);
      setCurrentView('loading');
      
      try {
        // Read file content
        const fileDataContent = await readFileContent(uploadedFile);
        
        // Store file data for later use in chat
        setFileData(fileDataContent);
        setMimeType(uploadedFile.type);
        
        // Make API call to analyze endpoint
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileData: fileDataContent,
            mimeType: uploadedFile.type,
            language: language,
            isInitialAnalysis: true
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let summaryContent = '';
        
        // Initialize chat with user message first, then AI response
        const initialUserMessage = {
          id: 1,
          type: 'user',
          content: `I've uploaded a document named "${uploadedFile.name}". Please analyze it and provide a summary in ${language}.`,
          timestamp: new Date(),
          role: 'user',
          text: `I've uploaded a document named "${uploadedFile.name}". Please analyze it and provide a summary in ${language}.`
        };
        
        const initialAiMessage = {
          id: 2,
          type: 'ai',
          content: `Hello! I'm analyzing your ${uploadedFile.name} and creating a comprehensive summary in ${language}. Please wait...`,
          timestamp: new Date(),
          role: 'model',
          text: `Hello! I'm analyzing your ${uploadedFile.name} and creating a comprehensive summary in ${language}. Please wait...`
        };
        
        setMessages([initialUserMessage, initialAiMessage]);
        setChatHistory([initialUserMessage, initialAiMessage]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'content') {
                  summaryContent += data.content;
                  // Update the summary in real-time
                  setSummaryContent(summaryContent);
                } else if (data.type === 'done') {
                  setIsAnalyzing(false);
                  setCurrentView('results_ready');
                  
                  // Initialize chat history with USER message first, then AI response
                  const userMessage = {
                    id: 1,
                    type: 'user',
                    content: `I've uploaded a document named "${uploadedFile.name}". Please analyze it and provide a summary in ${language}.`,
                    timestamp: new Date(),
                    role: 'user',
                    text: `I've uploaded a document named "${uploadedFile.name}". Please analyze it and provide a summary in ${language}.`
                  };
                  
                  const aiSummaryMessage = {
                    id: 2,
                    type: 'ai',
                    content: `Hello! I've analyzed your ${uploadedFile.name} and created a comprehensive summary in ${language}. Feel free to ask me any questions about the content!`,
                    timestamp: new Date(),
                    role: 'model',
                    text: `Hello! I've analyzed your ${uploadedFile.name} and created a comprehensive summary in ${language}. Feel free to ask me any questions about the content!`
                  };
                  
                  setMessages([userMessage, aiSummaryMessage]);
                  setChatHistory([userMessage, aiSummaryMessage]);
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error analyzing file:', error);
        setIsAnalyzing(false);
        setCurrentView('results_ready');
        
        // Show error message with proper user message first
        const errorUserMessage = {
          id: 1,
          type: 'user',
          content: `I've uploaded a document named "${uploadedFile.name}". Please analyze it and provide a summary in ${language}.`,
          timestamp: new Date(),
          role: 'user',
          text: `I've uploaded a document named "${uploadedFile.name}". Please analyze it and provide a summary in ${language}.`
        };
        
        const errorAiMessage = {
          id: 2,
          type: 'ai',
          content: `Sorry, I encountered an error while analyzing your file. Please try again. Error: ${error.message}`,
          timestamp: new Date(),
          role: 'model',
          text: `Sorry, I encountered an error while analyzing your file. Please try again. Error: ${error.message}`
        };
        
        setMessages([errorUserMessage, errorAiMessage]);
        setChatHistory([errorUserMessage, errorAiMessage]);
      }
    }
  };

  const handleSendMessage = async () => {
    if (chatInput.trim()) {
      const currentInput = chatInput;
      setChatInput('');
      
      // Create user message
      const userMessage = {
        id: chatHistory.length + 1,
        type: 'user',
        content: currentInput,
        timestamp: new Date(),
        role: 'user',
        text: currentInput
      };
      
      // Create AI message placeholder
      const aiMessagePlaceholder = {
        id: chatHistory.length + 2,
        type: 'ai',
        content: '',
        timestamp: new Date(),
        role: 'model',
        text: ''
      };
      
      // Add both messages to state immediately
      setChatHistory(prev => [...prev, userMessage, aiMessagePlaceholder]);
      setMessages(prev => [...prev, userMessage, aiMessagePlaceholder]);
      
      try {
        // Prepare chat history for context (excluding the placeholder we just added)
        const apiChatHistory = chatHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }]
        }));
        
        // Add the current user message to history
        apiChatHistory.push({
          role: 'user',
          parts: [{ text: currentInput }]
        });

        // Make API call to analyze endpoint for chat
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileData: fileData,
            mimeType: uploadedFile.type,
            language: language,
            chatHistory: apiChatHistory,
            isInitialAnalysis: false,
            userMessage: currentInput
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'content') {
                  // Update only the last message (AI placeholder) with the new content
                  setChatHistory(prevHistory => {
                    // Get the last message in the history array
                    const lastMessage = prevHistory[prevHistory.length - 1];
                    
                    // Create a new, updated message object
                    const updatedLastMessage = {
                      ...lastMessage, // Copy all properties from the last message
                      text: lastMessage.text + data.content, // Append the new chunk
                      content: lastMessage.content + data.content, // Also update content for display
                    };

                    // Return a new array with the old last message replaced by the updated one
                    return [
                      ...prevHistory.slice(0, -1),
                      updatedLastMessage,
                    ];
                  });
                  
                  setMessages(prevMessages => {
                    // Get the last message in the messages array
                    const lastMessage = prevMessages[prevMessages.length - 1];
                    
                    // Create a new, updated message object
                    const updatedLastMessage = {
                      ...lastMessage, // Copy all properties from the last message
                      text: lastMessage.text + data.content, // Append the new chunk
                      content: lastMessage.content + data.content, // Also update content for display
                    };

                    // Return a new array with the old last message replaced by the updated one
                    return [
                      ...prevMessages.slice(0, -1),
                      updatedLastMessage,
                    ];
                  });
                } else if (data.type === 'done') {
                  // Chat response complete
                  break;
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Update the AI placeholder with error message
        setChatHistory(prevHistory => {
          // Get the last message in the history array
          const lastMessage = prevHistory[prevHistory.length - 1];
          
          // Create a new, updated message object with error content
          const updatedLastMessage = {
            ...lastMessage, // Copy all properties from the last message
            text: `Sorry, I encountered an error while processing your question. Please try again. Error: ${error.message}`,
            content: `Sorry, I encountered an error while processing your question. Please try again. Error: ${error.message}`,
          };

          // Return a new array with the old last message replaced by the updated one
          return [
            ...prevHistory.slice(0, -1),
            updatedLastMessage,
          ];
        });
        
        setMessages(prevMessages => {
          // Get the last message in the messages array
          const lastMessage = prevMessages[prevMessages.length - 1];
          
          // Create a new, updated message object with error content
          const updatedLastMessage = {
            ...lastMessage, // Copy all properties from the last message
            text: `Sorry, I encountered an error while processing your question. Please try again. Error: ${error.message}`,
            content: `Sorry, I encountered an error while processing your question. Please try again. Error: ${error.message}`,
          };

          // Return a new array with the old last message replaced by the updated one
          return [
            ...prevMessages.slice(0, -1),
            updatedLastMessage,
          ];
        });
      }
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else if (fileType === 'application/pdf') {
      return (
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      );
    }
  };

  // Quiz generation function
  const generateNewQuiz = async () => {
    if (!uploadedFile) {
      alert('Please upload a file first before generating a quiz.');
      return;
    }

    setIsGeneratingQuiz(true);

    try {
      // Read file content
      const fileData = await readFileContent(uploadedFile);
      
      // Make API call to quiz endpoint
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: fileData,
          mimeType: uploadedFile.type
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.quiz) {
        setQuizQuestions(data.quiz);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setQuizScore(0);
        setIsQuizComplete(false);
        setCurrentView('quiz');
      } else {
        throw new Error(data.error || 'Failed to generate quiz');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert(`Failed to generate quiz: ${error.message}`);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Quiz completed
      calculateScore();
      setCurrentView('quiz_results');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach(question => {
      if (userAnswers[question.id] === question.correctAnswer) {
        score++;
      }
    });
    setQuizScore(score);
    setIsQuizComplete(true);
  };

  return (
    <main className="min-h-screen bg-light-bg text-slate-900">
      {/* Sticky Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm border-b border-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Home Link */}
            <Link 
              href="/" 
              className="text-slate-900 font-semibold text-lg hover:text-blue-600 transition-all duration-300 hover:scale-105 hover:drop-shadow-lg hover:drop-shadow-blue-500/50"
            >
              Home
            </Link>
            
            {/* Start Learning Button */}
            <Link href="/upload">
              <button className="px-6 py-2 border border-slate-600 hover:border-slate-700 text-slate-900 font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:bg-slate-200/50 hover:shadow-lg hover:shadow-slate-500/25">
                Start Learning
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 min-h-screen px-4">
        {currentView === 'uploading' && (
          <div className="max-w-4xl mx-auto py-12">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-blue-600 bg-clip-text text-transparent">
                Upload Your Study Material
              </h1>
            </div>

            {/* File Dropzone */}
            <div className="relative mb-8">
              <div
                className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 cursor-pointer ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-100 scale-105 shadow-lg shadow-blue-500/20'
                    : 'border-slate-400 hover:border-slate-500 hover:bg-slate-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClickUpload}
              >
                {/* Upload Icon */}
                <div className="mb-6">
                  <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                    isDragOver ? 'bg-blue-200 scale-110' : 'bg-slate-200'
                  }`}>
                    <svg 
                      className={`w-12 h-12 transition-colors duration-300 ${
                        isDragOver ? 'text-blue-600' : 'text-slate-600'
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Upload Text */}
                <h3 className="text-3xl font-semibold mb-4 text-slate-900">
                  {isDragOver ? 'Drop Your File Here' : 'Drop Your Notes Here'}
                </h3>
                <p className="text-lg text-slate-600 mb-2">
                  Drag and drop your file, or click to browse
                </p>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,audio/mpeg"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Staging Area */}
            <div className="mb-8">
              {!uploadedFile ? (
                <div className="text-center p-8 bg-slate-100 rounded-xl border border-slate-200">
                  <p className="text-slate-600 text-lg">
                    Accepted files: <span className="font-semibold">PDF, Images, MP3 Audio</span>
                  </p>
                </div>
              ) : (
                <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                        {getFileIcon(uploadedFile.type)}
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-slate-900">{uploadedFile.name}</h4>
                        <p className="text-slate-600">{formatFileSize(uploadedFile.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-slate-400 hover:text-red-500 transition-colors duration-200 p-2 hover:bg-red-50 rounded-lg"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pre-Analysis Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-end justify-center">
              <div className="flex-1 max-w-md">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Enter Summary Language
                </label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g., English, Hindi, Marathi..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-500"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={!uploadedFile || !language.trim()}
                className={`px-8 py-3 font-semibold rounded-lg transition-all duration-300 ${
                  uploadedFile && language.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                Analyze Notes
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {currentView === 'loading' && (
          <div className="max-w-2xl mx-auto py-20 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Analyzing Your Content
              </h2>
              <p className="text-xl text-slate-600">
                Generating your summary in <span className="font-semibold text-blue-600">{language}</span>...
              </p>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        )}

        {/* Results & Chat View */}
        {currentView === 'results_ready' && (
          <div className="max-w-7xl mx-auto py-8">
            <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
              {/* Left Column - Summary */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-900">Your AI-Generated Summary</h2>
                  <p className="text-slate-600 mt-1">Based on {uploadedFile.name}</p>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="prose prose-slate max-w-none">
                    {summaryContent ? (
                      <div className="text-slate-700 leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {summaryContent}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-slate-500">Summary will appear here after analysis...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Chat Interface */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                <div className="p-6 border-b border-slate-200 flex-shrink-0">
                  <h2 className="text-2xl font-bold text-slate-900">Ask a Follow-up Question</h2>
                  <p className="text-slate-600 mt-1">Chat with AI about your study material</p>
                </div>
                
                {/* Messages Area */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 flex-grow">
                  {chatHistory.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        <div className="text-sm">
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                        <p className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-slate-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-6 border-t border-slate-200 flex-shrink-0">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask anything about your notes..."
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim()}
                      className={`px-6 py-3 font-semibold rounded-lg transition-all duration-300 ${
                        chatInput.trim()
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Send
                    </button>
                  </div>
                  
                  {/* Generate Quiz Button */}
                  <div className="mt-4 text-center">
                    <button
                      onClick={generateNewQuiz}
                      disabled={isGeneratingQuiz}
                      className={`px-8 py-3 font-semibold rounded-lg transition-all duration-300 transform ${
                        isGeneratingQuiz
                          ? 'bg-slate-400 text-slate-200 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white hover:scale-105 hover:shadow-lg hover:shadow-green-500/25'
                      }`}
                    >
                      {isGeneratingQuiz ? 'Generating Quiz...' : 'Generate New Quiz'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Interface */}
        {currentView === 'quiz' && quizQuestions.length > 0 && (
          <div className="max-w-4xl mx-auto py-8">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              {/* Quiz Header */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-slate-900">Quiz Time!</h2>
                  <div className="text-slate-600">
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%`}}
                  ></div>
                </div>
              </div>

              {/* Question */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-6">
                  {quizQuestions[currentQuestionIndex].question}
                </h3>

                {/* Options */}
                <div className="space-y-3">
                  {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        userAnswers[quizQuestions[currentQuestionIndex].id] === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${quizQuestions[currentQuestionIndex].id}`}
                        value={index}
                        checked={userAnswers[quizQuestions[currentQuestionIndex].id] === index}
                        onChange={() => handleAnswerSelect(quizQuestions[currentQuestionIndex].id, index)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                        userAnswers[quizQuestions[currentQuestionIndex].id] === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-slate-300'
                      }`}>
                        {userAnswers[quizQuestions[currentQuestionIndex].id] === index && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="text-slate-900">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="p-6 border-t border-slate-200 flex justify-between">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`px-6 py-3 font-semibold rounded-lg transition-all duration-300 ${
                    currentQuestionIndex === 0
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  Previous
                </button>
                
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  {currentQuestionIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Results */}
        {currentView === 'quiz_results' && (
          <div className="max-w-4xl mx-auto py-8">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              {/* Results Header */}
              <div className="p-6 border-b border-slate-200 text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Quiz Complete!</h2>
                <div className="text-6xl font-bold text-blue-600 mb-2">
                  {quizScore}/{quizQuestions.length}
                </div>
                <p className="text-xl text-slate-600">
                  You scored {Math.round((quizScore / quizQuestions.length) * 100)}%
                </p>
              </div>

              {/* Detailed Results */}
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-slate-900 mb-6">Question Review</h3>
                <div className="space-y-6">
                  {quizQuestions.map((question, questionIndex) => {
                    const userAnswer = userAnswers[question.id];
                    const isCorrect = userAnswer === question.correctAnswer;
                    
                    return (
                      <div key={question.id} className="border border-slate-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-lg font-semibold text-slate-900">
                            Question {questionIndex + 1}
                          </h4>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isCorrect 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </div>
                        </div>
                        
                        <p className="text-slate-700 mb-4">{question.question}</p>
                        
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => {
                            let optionClass = "p-3 rounded-lg border ";
                            
                            if (optionIndex === question.correctAnswer) {
                              optionClass += "border-green-500 bg-green-50 text-green-800";
                            } else if (optionIndex === userAnswer && !isCorrect) {
                              optionClass += "border-red-500 bg-red-50 text-red-800";
                            } else {
                              optionClass += "border-slate-200 bg-slate-50 text-slate-600";
                            }
                            
                            return (
                              <div key={optionIndex} className={optionClass}>
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">
                                    {String.fromCharCode(65 + optionIndex)}.
                                  </span>
                                  <span>{option}</span>
                                  {optionIndex === question.correctAnswer && (
                                    <span className="ml-2 text-green-600">✓</span>
                                  )}
                                  {optionIndex === userAnswer && !isCorrect && (
                                    <span className="ml-2 text-red-600">✗</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                          <h5 className="font-semibold text-slate-900 mb-2">Explanation:</h5>
                          <p className="text-slate-700">{question.explanation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-slate-200 text-center">
                <button
                  onClick={generateNewQuiz}
                  disabled={isGeneratingQuiz}
                  className={`px-8 py-3 font-semibold rounded-lg transition-all duration-300 transform mr-4 ${
                    isGeneratingQuiz
                      ? 'bg-slate-400 text-slate-200 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white hover:scale-105 hover:shadow-lg hover:shadow-green-500/25'
                  }`}
                >
                  {isGeneratingQuiz ? 'Generating Quiz...' : 'Generate New Quiz'}
                </button>
                <button
                  onClick={() => setCurrentView('results_ready')}
                  className="px-8 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Back to Summary
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
