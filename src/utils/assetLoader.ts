import { convertFileSrc } from '@tauri-apps/api/core';

/**
 * Convert an asset path to a URL that can be used in the frontend
 * Works in both development and production modes across all platforms
 *
 * @param relativePath - Relative path from public folder (e.g., 'assets/background/ui.png')
 * @returns A URL that works in both dev and production environments
 */
export async function getAssetUrl(relativePath: string): Promise<string> {
  // Normalize path separators to forward slashes for consistency
  const normalizedPath = relativePath.replace(/\\/g, '/');

  // Check if running in Tauri environment
  if (window.__TAURI__) {
    // In Tauri production, assets are bundled with the frontend dist
    // We need to use convertFileSrc to properly resolve the path
    // The assets are already in the dist folder, so we use them directly
    return convertFileSrc(normalizedPath, 'asset');
  } else {
    // In development mode with Vite, public folder assets are served at root
    return `/${normalizedPath}`;
  }
}

/**
 * Synchronous version for cases where we can't use async
 * Works in both development and production modes
 *
 * @param relativePath - Relative path from public folder
 * @returns A URL that works in both dev and production environments
 */
export function getAssetUrlSync(relativePath: string): string {
  const normalizedPath = relativePath.replace(/\\/g, '/');

  if (window.__TAURI__) {
    return convertFileSrc(normalizedPath, 'asset');
  } else {
    return `/${normalizedPath}`;
  }
}

/**
 * Preloads an image and returns a Promise that resolves when loaded
 *
 * @param src - Image source URL
 * @returns Promise that resolves with the loaded image element
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
    img.src = src;
  });
}
