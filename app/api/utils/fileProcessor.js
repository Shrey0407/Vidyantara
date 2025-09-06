// Utility functions for processing uploaded files

export function extractTextFromFile(file, fileType) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        
        switch (fileType) {
          case 'application/pdf':
            // For PDF files, we'll need a PDF parser library
            // For now, we'll return the raw content and let the AI handle it
            resolve(content);
            break;
            
          case 'image/jpeg':
          case 'image/png':
          case 'image/gif':
          case 'image/webp':
            // For images, we'll return a base64 encoded string
            // The AI can process images directly
            resolve(content);
            break;
            
          case 'audio/mpeg':
          case 'audio/mp3':
            // For audio files, we'll return the base64 content
            // Note: Gemini Pro might not support audio directly
            resolve(content);
            break;
            
          default:
            // For text files or unknown types
            resolve(content);
        }
      } catch (error) {
        reject(new Error('Failed to process file: ' + error.message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    // Read as data URL for images and audio, as text for others
    if (fileType.startsWith('image/') || fileType.startsWith('audio/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  });
}

export function validateFileType(fileType) {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'audio/mpeg',
    'audio/mp3',
    'text/plain'
  ];
  
  return allowedTypes.includes(fileType);
}

export function getFileTypeDescription(fileType) {
  const descriptions = {
    'application/pdf': 'PDF Document',
    'image/jpeg': 'JPEG Image',
    'image/png': 'PNG Image',
    'image/gif': 'GIF Image',
    'image/webp': 'WebP Image',
    'audio/mpeg': 'MP3 Audio',
    'audio/mp3': 'MP3 Audio',
    'text/plain': 'Text File'
  };
  
  return descriptions[fileType] || 'Unknown File Type';
}
