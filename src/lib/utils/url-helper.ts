// Environment-aware URL helper for all services
export const getEnvironmentUrls = () => {
  const isProduction = import.meta.env.PROD;
  
  return {
    apiUrl: isProduction 
      ? 'https://web-production-0cc6.up.railway.app/api'
      : import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
    
    baseUrl: isProduction
      ? 'https://web-production-0cc6.up.railway.app'
      : 'http://localhost:8000',
      
    storageUrl: isProduction
      ? 'https://web-production-0cc6.up.railway.app/storage'
      : 'http://localhost:8000/storage'
  };
};

// Helper function to generate image URLs consistently
export const getImageUrl = (imagePath?: string, folder: string = '', defaultImage: string = ''): string => {
  const { storageUrl } = getEnvironmentUrls();
  
  // If no image path provided, return default
  if (!imagePath || imagePath === 'null' || imagePath === '') {
    return defaultImage ? `${storageUrl}/defaults/${defaultImage}` : '';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it already starts with /storage, convert to full URL
  if (imagePath.startsWith('/storage/')) {
    return `${getEnvironmentUrls().baseUrl}${imagePath}`;
  }
  
  // If it's just filename, construct full Laravel storage URL
  if (!imagePath.includes('/')) {
    return folder 
      ? `${storageUrl}/${folder}/${imagePath}`
      : `${storageUrl}/${imagePath}`;
  }
  
  // Extract filename from any path structure
  let filename = imagePath;
  if (filename.includes('/')) {
    filename = filename.split('/').pop() || '';
  }
  
  // Return full Laravel storage URL
  return folder 
    ? `${storageUrl}/${folder}/${filename}`
    : `${storageUrl}/${filename}`;
};

// Specific helpers for different media types
export const getMentorImageUrl = (imagePath?: string): string => {
  return getImageUrl(imagePath, 'admin/mentor', 'mentor-default.jpg');
};

export const getTestimoniImageUrl = (imagePath?: string): string => {
  return getImageUrl(imagePath, 'admin/testimoni', 'testimoni-default.jpg');
};

export const getArtikelImageUrl = (imagePath?: string): string => {
  return getImageUrl(imagePath, 'admin/artikel', 'artikel-default.jpg');
};

export const getDocumentUrl = (filePath?: string, documentType: string = ''): string => {
  if (!filePath) return '';
  
  // Determine folder based on document type
  const folderMap: Record<string, string> = {
    'student_proof': 'beswan/wajib',
    'identity_proof': 'beswan/wajib', 
    'photo': 'beswan/wajib',
    'instagram_follow': 'beswan/sosmed',
    'twibbon_post': 'beswan/sosmed',
    'achievement_certificate': 'beswan/pendukung',
    'recommendation_letter': 'beswan/pendukung',
    'essay_motivation': 'beswan/pendukung',
    'cv_resume': 'beswan/pendukung',
    'other_document': 'beswan/pendukung',
  };

  const folder = folderMap[documentType] || 'beswan/other';
  return getImageUrl(filePath, folder);
};
