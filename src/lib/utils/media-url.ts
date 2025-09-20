// Media URL Helper
// Centralized function to get correct media URLs

/**
 * Get the base URL for media assets
 */
export const getMediaBaseUrl = (): string => {
  // For production, use api.bersekolah.com directly
  if (import.meta.env.PROD) {
    return 'https://api.bersekolah.com';
  }
  
  // For development, use localhost or the configured API URL
  const apiUrl = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
  
  // Handle different URL formats
  if (apiUrl.includes('localhost')) {
    // For localhost, remove /api if it exists
    if (apiUrl.endsWith('/api')) {
      return apiUrl.slice(0, -4); // Remove '/api' from the end
    }
    return apiUrl;
  }
  
  // For other URLs (like bersekolah.com), ensure we have the correct format
  if (apiUrl.includes('bersekolah.com')) {
    // If it's bersekolah.com without api prefix, add it
    if (!apiUrl.includes('api.bersekolah.com')) {
      return 'https://api.bersekolah.com';
    }
    // If it already has /api, remove it
    if (apiUrl.endsWith('/api')) {
      return apiUrl.slice(0, -4);
    }
    return apiUrl;
  }
  
  // Default fallback
  return apiUrl;
};

/**
 * Get full URL for media assets
 * @param path - The media path (e.g., '/assets/image/navbar/logo.png')
 * @returns Full URL for the media asset
 */
export const getMediaUrl = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const baseURL = getMediaBaseUrl();
  return `${baseURL}/${cleanPath}`;
};

/**
 * Get URL for storage files (uploaded files)
 * @param path - The storage path (e.g., 'storage/testimoni/image.jpg')
 * @returns Full URL for the storage file
 */
export const getStorageUrl = (path: string): string => {
  const baseURL = getMediaBaseUrl();
  return `${baseURL}/${path}`;
};

/**
 * Get default image URL for fallback
 * @param type - Type of default image (mentor, testimoni, user, etc.)
 * @returns Default image URL
 */
export const getDefaultImageUrl = (type: 'mentor' | 'testimoni' | 'user' | 'artikel' | 'logo'): string => {
  const baseURL = getMediaBaseUrl();
  
  const defaultPaths = {
    mentor: '/assets/image/defaults/mentor-default.jpg',
    testimoni: '/storage/defaults/testimoni-default.jpg',
    user: '/assets/image/defaults/user-default.jpg',
    artikel: '/assets/image/defaults/artikel-default.jpg',
    logo: '/assets/image/navbar/logo.png'
  };
  
  return `${baseURL}${defaultPaths[type]}`;
};
