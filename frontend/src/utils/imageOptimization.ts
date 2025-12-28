/**
 * Image optimization utilities for lazy loading and responsive images
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
}

/**
 * Generate optimized image URL (for Cloudinary or similar CDN)
 */
export const getOptimizedImageUrl = (
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string => {
  // If using Cloudinary
  if (originalUrl.includes('cloudinary.com')) {
    const { width = 800, height, quality = 80, format = 'webp' } = options;
    const transformations: string[] = [];
    
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);
    
    // Insert transformations into Cloudinary URL
    const urlParts = originalUrl.split('/upload/');
    if (urlParts.length === 2) {
      return `${urlParts[0]}/upload/${transformations.join(',')}/${urlParts[1]}`;
    }
  }
  
  // Fallback to original URL
  return originalUrl;
};

/**
 * Generate srcset for responsive images
 */
export const generateSrcSet = (
  baseUrl: string,
  sizes: number[] = [400, 800, 1200, 1600]
): string => {
  return sizes
    .map((size) => `${getOptimizedImageUrl(baseUrl, { width: size })} ${size}w`)
    .join(', ');
};

/**
 * Lazy load image component helper
 * Returns image URL with loading="lazy" attribute
 */
export const getLazyImageUrl = (url: string, placeholder?: string): string => {
  // Return placeholder or a low-quality version for initial load
  if (placeholder) return placeholder;
  
  // Generate a very low quality version for blur-up effect
  return getOptimizedImageUrl(url, { width: 20, quality: 20 });
};

/**
 * Check if image is already optimized
 */
export const isOptimizedImage = (url: string): boolean => {
  return url.includes('cloudinary.com') || url.includes('transform') || url.includes('w_');
};

/**
 * Get image dimensions from URL (if available)
 */
export const getImageDimensions = (url: string): { width?: number; height?: number } => {
  const match = url.match(/w_(\d+)|h_(\d+)/g);
  if (match) {
    const dimensions: { width?: number; height?: number } = {};
    match.forEach((m) => {
      if (m.startsWith('w_')) dimensions.width = parseInt(m.replace('w_', ''), 10);
      if (m.startsWith('h_')) dimensions.height = parseInt(m.replace('h_', ''), 10);
    });
    return dimensions;
  }
  return {};
};

/**
 * Preload critical images
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Batch preload images
 */
export const preloadImages = async (urls: string[]): Promise<void[]> => {
  return Promise.all(urls.map(preloadImage));
};

