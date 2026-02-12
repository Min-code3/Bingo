'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useCustomId } from './useCustomId';

export function useAnonymousUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // URL 파라미터로 전달된 커스텀 ID 관리
  const { currentId, isReady } = useCustomId();

  useEffect(() => {
    // Always initialize Supabase auth (needed for logging permissions)
    const initAuth = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 Initializing anonymous auth...');
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Found existing session:', session.user.id);
          }
          setUser(session.user);
        } else {
          // Sign in anonymously if no session exists
          if (process.env.NODE_ENV === 'development') {
            console.log('🔑 Creating new anonymous user...');
          }
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Anonymous user created:', data.user?.id);
          }
          setUser(data.user);
        }
      } catch (error) {
        console.error('❌ Error initializing anonymous user:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Return custom user ID if available, otherwise use Supabase user ID
  const finalUserId = currentId || user?.id;
  const finalLoading = loading || !isReady;

  if (process.env.NODE_ENV === 'development' && isReady && currentId) {
    console.log('📊 Final User ID:', finalUserId, '(Custom ID:', currentId, ')');
  }

  return { user, userId: finalUserId, loading: finalLoading };
}
