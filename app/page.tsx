'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/components/I18nProvider';
import { useBingoState } from '@/components/useBingoState';
import { cityLabel } from '@/lib/i18n';

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
      {/* 영상 섹션 */}
      <div className="landing-video-wrapper">
        <video
          ref={videoRef}
          className="landing-video"
          src="https://twkevftvombrvnwrladk.supabase.co/storage/v1/object/public/test/copy_E9DA0844-8512-4589-B28E-D7BCB7E04E1D.mov"
          controls
          muted
          playsInline
        />
      </div>

      {/* 텍스트 오버레이 */}
      <div className="landing-content">
        <div className="landing-text">
          <h1 className="landing-headline">
            {lang === 'en'
              ? "Just explore, snap photos, and we'll do the rest."
              : "탐험하고, 사진을 찍으면, 나머지는 저희가 할게요."}
          </h1>
          <p className="landing-subheadline">
            {lang === 'en'
              ? "We turn your trip into a memory like this."
              : "당신의 여행을 이런 추억으로 만들어드립니다."}
          </p>
        </div>

        {/* CTA 버튼 */}
        <div className="landing-cta">
          <button className="landing-start-btn" onClick={handleStartBingo}>
            {lang === 'en' ? 'Start Bingo →' : '빙고 시작하기 →'}
          </button>
          <p className="landing-disclaimer">
            {lang === 'en'
              ? "By continuing, you agree that your photos will be used to create your personal highlight video."
              : "계속 진행하면 사진이 개인 하이라이트 영상 제작에 사용되는 것에 동의하게 됩니다."}
          </p>
        </div>
      </div>
    </div>
  );
}
