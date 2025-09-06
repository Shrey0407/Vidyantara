# विद्याntara Backend Setup Guide

## Overview
This document provides complete setup instructions for the विद्याntara backend API routes that integrate with Google Gemini Pro for AI-powered content analysis and quiz generation.

## Prerequisites
- Node.js 18+ installed
- Google Gemini Pro API key
- Next.js 14+ project structure

## Security Setup

### 1. Environment Variables
The API key is securely stored in `.env.local` (already created):
```
GEMINI_API_KEY="AIzaSyBu7aSqccP_FZaLbsqSE4Zp_CkB07Ya224"
```

### 2. Git Security
The `.env.local` file is already included in `.gitignore` to prevent accidental commits of sensitive data.

## API Endpoints

### 1. Analysis Endpoint: `/api/analyze`
**Purpose**: Handles file analysis and chat interactions with streaming responses.

**Features**:
- Initial document analysis and summary generation
- Follow-up chat with context preservation
- Real-time streaming responses
- Multi-language support

**Request Format**:
```json
{
  "fileContent": "string",
  "language": "string",
  "chatHistory": "array (optional)",
  "isInitialAnalysis": "boolean"
}
```

**Response**: Server-Sent Events (SSE) stream with real-time content.

### 2. Quiz Generation Endpoint: `/api/quiz`
**Purpose**: Generates structured multiple-choice quizzes from document content.

**Features**:
- JSON-formatted quiz responses
- 5 questions per quiz
- Detailed explanations for each answer
- Fallback quiz system for error handling

**Request Format**:
```json
{
  "fileContent": "string"
}
```

**Response Format**:
```json
{
  "success": true,
  "quiz": [
    {
      "id": 1,
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": 0,
      "explanation": "string"
    }
  ]
}
```

## File Processing

### Supported File Types
- **PDF Documents**: `.pdf`
- **Images**: `.jpg`, `.png`, `.gif`, `.webp`
- **Audio**: `.mp3`
- **Text**: `.txt`

### File Processing Flow
1. File uploaded via frontend
2. Content extracted using `fileProcessor.js` utilities
3. Content sent to appropriate API endpoint
4. AI processes content and returns response
5. Response streamed back to frontend

## Error Handling

### Analysis API Errors
- **400**: Missing required fields (fileContent, language)
- **500**: Internal server errors, AI service failures
- **Streaming errors**: Graceful fallback with error messages

### Quiz API Errors
- **400**: Missing fileContent
- **500**: AI processing errors
- **Fallback**: Automatic fallback quiz generation

## CORS Configuration
Both endpoints include proper CORS headers for cross-origin requests:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Development Commands

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Test API Endpoints
```bash
# Test analysis endpoint
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"fileContent":"Sample content","language":"English","isInitialAnalysis":true}'

# Test quiz endpoint
curl -X POST http://localhost:3000/api/quiz \
  -H "Content-Type: application/json" \
  -d '{"fileContent":"Sample content"}'
```

## Production Considerations

### Environment Variables
Ensure the following environment variables are set in production:
- `GEMINI_API_KEY`: Your Google Gemini Pro API key
- `NODE_ENV`: Set to "production"

### Rate Limiting
Consider implementing rate limiting for production use:
- Per-user request limits
- API key usage monitoring
- Request throttling

### Error Monitoring
Implement proper error monitoring:
- Log all API errors
- Monitor AI service availability
- Track usage patterns

## Security Best Practices

1. **API Key Protection**: Never commit API keys to version control
2. **Input Validation**: All inputs are validated before processing
3. **Error Handling**: Sensitive information is not exposed in error messages
4. **CORS**: Properly configured for security
5. **File Validation**: File types are validated before processing

## Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Ensure `.env.local` exists and contains the correct key
   - Restart the development server after adding environment variables

2. **CORS Errors**
   - Check that CORS headers are properly set
   - Verify frontend is making requests to the correct origin

3. **Streaming Issues**
   - Ensure frontend properly handles Server-Sent Events
   - Check browser compatibility for SSE

4. **Quiz Generation Failures**
   - Check AI response format
   - Verify JSON parsing logic
   - Review fallback quiz generation

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` and check console logs for detailed error information.

## Support
For issues or questions regarding the backend implementation, refer to:
- Google Gemini Pro documentation
- Next.js API routes documentation
- Server-Sent Events specification
