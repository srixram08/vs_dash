import { supabase } from './supabase';

export const CLIENT_FILES_BUCKET = 'client-files';

/**
 * Creates a temporary signed URL for a private client file in Supabase Storage.
 * @param filePath The path inside the bucket (e.g. 'inquiries/uuid-file.pdf')
 * @param expiresInSeconds Duration in seconds for the signed URL (default 1 hour)
 */
export async function getSignedFileUrl(
  filePath: string,
  expiresInSeconds = 3600
): Promise<{ signedUrl: string | null; error: Error | null }> {
  try {
    // If it's already an external HTTP link, return it directly
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return { signedUrl: filePath, error: null };
    }

    // Clean leading slash if any
    const cleanPath = filePath.replace(/^\/+/, '');

    const { data, error } = await supabase.storage
      .from(CLIENT_FILES_BUCKET)
      .createSignedUrl(cleanPath, expiresInSeconds);

    if (error) {
      console.error('Error generating signed URL:', error);
      return { signedUrl: null, error: new Error(error.message) };
    }

    return { signedUrl: data.signedUrl, error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { signedUrl: null, error };
  }
}

/**
 * Extracts a human-readable filename from a storage path or URL
 */
export function getFileNameFromPath(pathOrUrl: string): string {
  try {
    const parts = pathOrUrl.split('/');
    const lastPart = parts[parts.length - 1] || 'file';
    // Remove query params if any
    return decodeURIComponent(lastPart.split('?')[0]);
  } catch {
    return 'file';
  }
}
