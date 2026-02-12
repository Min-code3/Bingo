'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const STORAGE_KEY = 'customUserId';

/**
 * URL 파라미터로 전달된 ID를 관리하는 훅
 * - URL에 ?id=값이 있으면 읽어서 상태로 관리
 * - localStorage에 저장해서 브라우저가 기억
 * - URL에 id가 없으면 localStorage 값을 URL에 자동으로 붙임
 */
export function useCustomId() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // URL에서 id 파라미터 읽기
    const urlId = searchParams.get('id');

    if (urlId) {
      // URL에 id가 있으면 그 값을 사용하고 저장
      if (process.env.NODE_ENV === 'development') {
        console.log('🆔 URL에서 ID 감지:', urlId);
      }
      setCurrentId(urlId);
      localStorage.setItem(STORAGE_KEY, urlId);
      setIsReady(true);
    } else {
      // URL에 id가 없으면 localStorage에서 복원
      const storedId = localStorage.getItem(STORAGE_KEY);

      if (storedId) {
        // localStorage에 값이 있으면 URL에 다시 추가
        if (process.env.NODE_ENV === 'development') {
          console.log('🆔 localStorage에서 복원:', storedId);
        }
        setCurrentId(storedId);
        // 현재 pathname 유지하면서 id 파라미터만 추가 (페이지 새로고침 없이)
        const pathname = window.location.pathname;
        router.replace(`${pathname}?id=${storedId}`, { scroll: false });
        setIsReady(true);
      } else {
        // 둘 다 없으면 null
        if (process.env.NODE_ENV === 'development') {
          console.log('🆔 ID 없음 - 익명 모드');
        }
        setCurrentId(null);
        setIsReady(true);
      }
    }
  }, [searchParams, router]);

  /**
   * ID를 수동으로 변경하는 함수
   * URL과 localStorage 모두 업데이트
   */
  const updateId = (newId: string | null) => {
    const pathname = window.location.pathname;
    if (newId) {
      setCurrentId(newId);
      localStorage.setItem(STORAGE_KEY, newId);
      router.replace(`${pathname}?id=${newId}`, { scroll: false });
    } else {
      setCurrentId(null);
      localStorage.removeItem(STORAGE_KEY);
      router.replace(pathname, { scroll: false });
    }
  };

  /**
   * 저장된 ID 삭제
   */
  const clearId = () => {
    setCurrentId(null);
    localStorage.removeItem(STORAGE_KEY);
    const pathname = window.location.pathname;
    router.replace(pathname, { scroll: false });
  };

  return {
    currentId,      // 현재 ID 값
    isReady,        // ID 로딩 완료 여부
    updateId,       // ID 수동 변경
    clearId,        // ID 삭제
  };
}
