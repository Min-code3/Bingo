'use client';

import React, { useRef, useState } from 'react';
import { resizeImage, generateDummyPhoto } from '@/lib/image-utils';
import { uploadImageToSupabase } from '@/lib/upload-utils';
import { logCustomEvent } from '@/lib/logger';
import { useI18n } from './I18nProvider';

interface UploadButtonProps {
  hasPhoto: boolean;
  onUpload: (photo: string) => void;
  userId?: string; // Optional: if provided, uploads to Supabase
  uploadPrefix?: string; // Optional: prefix for uploaded files (e.g., "food", "main")
}

export default function UploadButton({ hasPhoto, onUpload, userId, uploadPrefix = 'photo' }: UploadButtonProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    // Log photo selection
    logCustomEvent(userId, 'photo_upload', {
      target: uploadPrefix,
      metadata: {
        file_size: file.size,
        file_type: file.type,
        upload_prefix: uploadPrefix,
        has_user_id: !!userId,
        timestamp: new Date().toISOString(),
      },
    });

    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        const resized = await resizeImage(dataUrl, 400);

        // Upload to Supabase if userId is provided
        if (userId) {
          try {
            const publicUrl = await uploadImageToSupabase(resized, userId, uploadPrefix);
            onUpload(publicUrl);

            // Log successful upload
            logCustomEvent(userId, 'photo_upload_success', {
              target: uploadPrefix,
              metadata: {
                storage: 'supabase',
                upload_prefix: uploadPrefix,
                timestamp: new Date().toISOString(),
              },
            });
          } catch (error) {
            console.error('Supabase upload failed:', error);

            // Log failed upload
            logCustomEvent(userId, 'photo_upload_failed', {
              target: uploadPrefix,
              metadata: {
                error: String(error),
                upload_prefix: uploadPrefix,
                timestamp: new Date().toISOString(),
              },
            });

            // Fallback to base64 if Supabase fails
            onUpload(resized);
          }
        } else {
          // Use base64 if no userId (backwards compatibility)
          onUpload(resized);
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="upload-btn-group" onClick={(e) => e.stopPropagation()}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <button
        className="upload-btn"
        onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
        disabled={uploading}
      >
        {uploading ? t('upload.uploading') : (hasPhoto ? t('upload.change') : t('upload.upload'))}
      </button>
    </div>
  );
}
