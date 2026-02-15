'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/components/I18nProvider';
import { useBingoState } from '@/components/useBingoState';
import { cityLabel } from '@/lib/i18n';
import LanguageToggle from '@/components/LanguageToggle';

export default function LandingPage() {
  const router = useRouter();
  const { lang } = useI18n();
  const { cityId } = useBingoState();
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleStartBingo = () => {
    router.push('/bingo');
  };

  return (
    <div className="landing-page">
      <LanguageToggle />
      {/* 영상 섹션 */}
      <div className="landing-video-wrapper">
        <video
          ref={videoRef}
          className="landing-video"
          src="https://twkevftvombrvnwrladk.supabase.co/storage/v1/object/public/test/landing%20video.mp4"
          autoPlay
          muted
          playsInline
          controls
        />
      </div>

      {/* 텍스트 오버레이 */}
      <div className="landing-content">
        <div className="landing-text">
          <h1 className="landing-headline">
            {lang === 'en'
              ? "Make today unforgettable for your future self"
              : "10년 뒤에도 선명할 오늘을 남기세요"}
          </h1>
          <p className="landing-subheadline">
            {lang === 'en'
              ? "We turn your journey into a short film."
              : "당신의 여행을 작은 영화로 만들어드립니다."}
          </p>
        </div>

        {/* CTA 버튼 */}
        <div className="landing-cta">
          <button className="landing-start-btn" onClick={handleStartBingo}>
            {lang === 'en' ? 'Start Your Journey →' : '여행 기록 시작하기 →'}
          </button>
          <p className="landing-disclaimer">
            {lang === 'en'
              ? "Your photos are used only for your personal video and won't be shared without permission."
              : "업로드한 사진은 개인 영상 제작에만 사용되며, 허락 없이 공유되지 않습니다."}
          </p>
        </div>
      </div>
      {/* 언어 버튼과 겹치지 않도록 여유 공간 */}
      <div style={{ height: '80px' }} />
    </div>
  );
}
