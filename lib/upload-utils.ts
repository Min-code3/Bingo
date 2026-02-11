import { supabase } from './supabase';

/**
 * Upload a base64 image to Supabase Storage
 * @param dataUrl - Base64 data URL (e.g., "data:image/jpeg;base64,...")
 * @param userId - User ID for organizing uploads
 * @param prefix - Optional prefix for the file (e.g., "food", "main")
 * @returns Public URL of the uploaded image
 */
export async function uploadImageToSupabase(
  dataUrl: string,
  userId: string,
  prefix: string = 'photo'
): Promise<string> {
  // Convert data URL to blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const extension = blob.type.split('/')[1] || 'jpg';
  const filename = `${userId}/${prefix}_${timestamp}_${random}.${extension}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('user-uploads')
    .upload(filename, blob, {
      contentType: blob.type,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('user-uploads')
    .getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Delete an image from Supabase Storage
 * @param publicUrl - The public URL of the image to delete
 */
export async function deleteImageFromSupabase(publicUrl: string): Promise<void> {
  try {
    // Extract the path from the public URL
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split('/user-uploads/');
    if (pathParts.length < 2) return;

    const filePath = pathParts[1];

    const { error } = await supabase.storage
      .from('user-uploads')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}
