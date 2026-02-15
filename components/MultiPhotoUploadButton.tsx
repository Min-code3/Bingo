'use client';

import React, { useRef, useState } from 'react';
import { resizeImage } from '@/lib/image-utils';
import { uploadImageToSupabase } from '@/lib/upload-utils';
import { logCustomEvent, nowTokyo } from '@/lib/logger';
import { useI18n } from './I18nProvider';

interface MultiPhotoUploadButtonProps {
  remainingSlots: number;  // 0-3
  onUpload: (photos: string[]) => void;  // Callback with array of uploaded URLs
  userId?: string;
  uploadPrefix?: string;
  cellId?: string;  // For logging
}

export default function MultiPhotoUploadButton({
  remainingSlots,
  onUpload,
  userId,
  uploadPrefix = 'photo',
  cellId
}: MultiPhotoUploadButtonProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { t, lang } = useI18n();
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    // Limit to remaining slots
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    logCustomEvent(userId, 'multi_photo_upload', {
      target: uploadPrefix,
      metadata: {
        cell_id: cellId,
        file_count: filesToProcess.length,
        remaining_slots: remainingSlots,
        timestamp: nowTokyo(),
      },
    });

    try {
      // Process all files in parallel (same pattern as FreePhotoUpload)
      const uploadPromises = filesToProcess.map(async (file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = async (ev) => {
            const dataUrl = ev.target?.result as string;
            const resized = await resizeImage(dataUrl, 500);

            if (userId) {
              try {
                const publicUrl = await uploadImageToSupabase(resized, userId, uploadPrefix);
                resolve(publicUrl);
              } catch (error) {
                console.error('Upload failed, using base64:', error);
                resolve(resized);  // Fallback to base64
              }
            } else {
              resolve(resized);
            }
          };
          reader.readAsDataURL(file);
        });
      });

      const urls = await Promise.all(uploadPromises);
      onUpload(urls);

      logCustomEvent(userId, 'multi_photo_upload_success', {
        target: uploadPrefix,
        metadata: {
          cell_id: cellId,
          count: urls.length,
          timestamp: nowTokyo(),
        },
      });
    } catch (error) {
      console.error('Multi-photo upload error:', error);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (remainingSlots <= 0) return null;

  return (
    <button
      className="upload-btn multi-photo-btn"
      onClick={(e) => {
        e.stopPropagation();
        fileRef.current?.click();
      }}
      disabled={uploading}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple  // KEY: Allow multiple file selection
        className="hidden"
        onChange={handleFiles}
        style={{ display: 'none' }}
      />
      {uploading ? (
        t('upload.uploading')
      ) : (
        lang === 'ko'
          ? `📸 사진 추가 (${remainingSlots}/3)`
          : `📸 Add Photo (${remainingSlots}/3)`
      )}
    </button>
  );
}
