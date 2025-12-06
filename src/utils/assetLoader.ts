import { convertFileSrc } from '@tauri-apps/api/core';
import { resolveResource } from '@tauri-apps/api/path';

/**
 * Convert an asset path to a URL that can be used in the frontend
 * Works in both development and production modes
 */
export async function getAssetUrl(assetPath: string): Promise<string> {
  try {
    const resourcePath = await resolveResource(assetPath);
    return convertFileSrc(resourcePath);
  } catch (error) {
    console.warn('Failed to resolve resource, using fallback:', error);
    return convertFileSrc(assetPath);
  }
}

/**
 * Synchronous version for cases where we can't use async
 * This works in development mode by directly converting the path
 */
export function getAssetUrlSync(assetPath: string): string {
  return convertFileSrc(assetPath);
}
