'use client';

/**
 * ====================================================================
 * URL 파라미터 기반 사용자 ID 관리 예제
 * ====================================================================
 *
 * 사용법:
 * 1. /?id=me 로 접속 → currentId = "me"
 * 2. /?id=user123 로 접속 → currentId = "user123"
 * 3. 뒤로가기로 id가 사라져도 자동으로 복원됨
 * 4. Supabase 로그에 currentId가 함께 저장됨
 */

import { useEffect } from 'react';
import { useBingoState } from '@/components/useBingoState';
import { logCustomEvent } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

export default function ExamplePage() {
  const { userId, hydrated } = useBingoState();

  useEffect(() => {
    if (!hydrated || !userId) return;

    console.log('✅ 현재 사용자 ID:', userId);

    // 예제 1: 페이지 로드 이벤트 로깅
    logCustomEvent(userId, 'page_loaded', {
      timestamp: new Date().toISOString(),
      customData: 'Any data you want',
    });

    // 예제 2: Supabase에 직접 데이터 저장
    const saveData = async () => {
      const { error } = await supabase
        .from('user_logs')
        .insert({
          user_id: userId,  // ← 여기에 currentId가 들어감
          action_type: 'custom_action',
          target: 'example',
          metadata: { test: true },
        });

      if (error) {
        console.error('❌ 데이터 저장 실패:', error);
      } else {
        console.log('✅ 데이터 저장 성공');
      }
    };

    saveData();
  }, [userId, hydrated]);

  if (!hydrated) {
    return <div>로딩 중...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>URL 파라미터 ID 관리 예제</h1>

      <div style={{
        background: '#f0f0f0',
        padding: 20,
        borderRadius: 8,
        marginTop: 20
      }}>
        <h2>현재 사용자 ID</h2>
        <p style={{ fontSize: 24, fontWeight: 'bold', color: '#0070f3' }}>
          {userId || '(익명)'}
        </p>
      </div>

      <div style={{ marginTop: 30 }}>
        <h3>테스트 방법:</h3>
        <ol>
          <li>주소창에 <code>/?id=me</code> 입력</li>
          <li>위에 "me"가 표시됨</li>
          <li>주소창에서 <code>?id=me</code> 부분 삭제</li>
          <li>엔터 → 자동으로 다시 <code>/?id=me</code>로 복원됨</li>
          <li>새 탭에서 <code>/?id=test</code> 입력 → "test"로 변경됨</li>
        </ol>
      </div>

      <div style={{
        marginTop: 30,
        background: '#fffbea',
        padding: 15,
        borderRadius: 8,
        border: '1px solid #f59e0b'
      }}>
        <h3>📊 Supabase 로그 확인</h3>
        <p>
          Supabase 대시보드 → Tables → user_logs 테이블에서<br/>
          <code>user_id</code> 컬럼에 현재 ID 값이 저장되는지 확인하세요.
        </p>
      </div>

      <div style={{ marginTop: 30 }}>
        <h3>버튼 클릭 테스트</h3>
        <button
          onClick={() => {
            logCustomEvent(userId, 'button_click', {
              button_name: 'test_button',
              clicked_at: new Date().toISOString(),
            });
            alert(`버튼 클릭 로그가 user_id="${userId}"로 저장되었습니다!`);
          }}
          style={{
            padding: '10px 20px',
            fontSize: 16,
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
          }}
        >
          클릭 이벤트 로깅 테스트
        </button>
      </div>
    </div>
  );
}
