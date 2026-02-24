'use client';

import React, { useRef, useState, useCallback } from 'react';
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
  const [isDebouncing, setIsDebouncing] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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
            const resized = await resizeImage(dataUrl, 1920);

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

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    // Prevent clicks during upload or debounce period
    if (uploading || isDebouncing) return;

    // Set debounce flag
    setIsDebouncing(true);

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Reset debounce after 500ms
    debounceTimerRef.current = setTimeout(() => {
      setIsDebouncing(false);
    }, 500);

    fileRef.current?.click();
  }, [uploading, isDebouncing]);

  if (remainingSlots <= 0) return null;

  return (
    <button
      className="upload-btn multi-photo-btn"
      onClick={handleClick}
      disabled={uploading || isDebouncing}
      style={{
        opacity: uploading || isDebouncing ? 0.6 : 1,
        cursor: uploading || isDebouncing ? 'not-allowed' : 'pointer',
      }}
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
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          {t('upload.uploading')}
        </span>
      ) : (
        lang === 'ko'
          ? `📸 사진 추가 (${remainingSlots}/3)`
          : `📸 Add Photo (${remainingSlots}/3)`
      )}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}
