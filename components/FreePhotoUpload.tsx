'use client';

import React, { useRef, useState } from 'react';
import { resizeImage } from '@/lib/image-utils';
import { uploadImageToSupabase } from '@/lib/upload-utils';
import { logCustomEvent, nowTokyo } from '@/lib/logger';
import { useI18n } from './I18nProvider';

interface FreePhotoUploadProps {
  remainingSlots: number;
  canUpload: boolean;
  onUpload: (urls: string[]) => void;
  userId?: string;
}

export default function FreePhotoUpload({ remainingSlots, canUpload, onUpload, userId }: FreePhotoUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { lang } = useI18n();
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    logCustomEvent(userId, 'free_photo_upload', {
      target: 'free',
      metadata: {
        file_count: filesToProcess.length,
        timestamp: nowTokyo(),
      },
    });

    try {
      const uploadPromises = filesToProcess.map(async (file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = async (ev) => {
            const dataUrl = ev.target?.result as string;
            const resized = await resizeImage(dataUrl, 500);

            if (userId) {
              try {
                const publicUrl = await uploadImageToSupabase(resized, userId, 'free');
                resolve(publicUrl);
              } catch {
                resolve(resized);
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

      logCustomEvent(userId, 'free_photo_upload_success', {
        target: 'free',
        metadata: {
          count: urls.length,
          timestamp: nowTokyo(),
        },
      });
    } catch (error) {
      console.error('Free photo upload error:', error);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (!canUpload) return null;

  const label = lang === 'en' ? 'Any photo you love' : '나의 최애 사진';
  const uploadingLabel = lang === 'en' ? 'Uploading...' : '업로드 중...';

  return (
    <button
      className="free-photo-btn"
      onClick={() => fileRef.current?.click()}
      disabled={uploading}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <span className="free-photo-btn-shimmer" />
      {uploading ? (
        <>
          <span className="free-photo-btn-spinner" />
          <span className="free-photo-btn-text">{uploadingLabel}</span>
        </>
      ) : (
        <>
          <span className="free-photo-btn-icon">
            <span className="free-photo-btn-camera">📸</span>
            <span className="free-photo-btn-plus">+</span>
          </span>
          <span className="free-photo-btn-text">{label}</span>
        </>
      )}
    </button>
  );
}
