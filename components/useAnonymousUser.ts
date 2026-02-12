'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAnonymousUser() {
  const [user, setUser] = useState<User | null>(null);
  const [customUserId, setCustomUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for custom user ID in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlUserId = urlParams.get('id');

    if (urlUserId) {
      // Use custom user ID from URL
      if (process.env.NODE_ENV === 'development') {
        console.log('🆔 Using custom user ID from URL:', urlUserId);
      }
      // Store in localStorage to persist across sessions
      localStorage.setItem('customUserId', urlUserId);
      setCustomUserId(urlUserId);
    } else {
      // Check for stored custom user ID
      const storedCustomUserId = localStorage.getItem('customUserId');
      if (storedCustomUserId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🆔 Using stored custom user ID:', storedCustomUserId);
        }
        setCustomUserId(storedCustomUserId);
      }
    }

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
  const finalUserId = customUserId || user?.id;

  return { user, userId: finalUserId, loading };
}
