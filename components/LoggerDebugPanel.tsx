'use client';

import { useState, useEffect } from 'react';
import { useBingoState } from './useBingoState';
import { supabase } from '@/lib/supabase';
import { logCustomEvent } from '@/lib/logger';

/**
 * Debug panel to test and verify the logger
 * Add this component temporarily to any page to test logging
 */
export default function LoggerDebugPanel() {
  const { userId } = useBingoState();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    if (!userId) {
      alert('No userId yet. Wait a moment for auth to initialize.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLogs(data || []);
      console.table(data);
      alert(`Found ${data?.length || 0} logs. Check console for details.`);
    } catch (error) {
      console.error('Error fetching logs:', error);
      alert('Error fetching logs. Check console.');
    } finally {
      setLoading(false);
    }
  };

  const testLog = () => {
    if (!userId) {
      alert('No userId yet. Wait a moment for auth to initialize.');
      return;
    }

    logCustomEvent(userId, 'test_event', {
      target: 'debug_panel',
      metadata: { test: true, timestamp: new Date().toISOString() },
    });

    alert('Test event logged! Wait a moment, then click "Fetch Recent Logs"');
  };

  const clearLogs = async () => {
    if (!userId) return;
    if (!confirm('Delete all logs for this user?')) return;

    try {
      const { error } = await supabase
        .from('user_logs')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      setLogs([]);
      alert('All logs cleared!');
    } catch (error) {
      console.error('Error clearing logs:', error);
      alert('Error clearing logs. Check console.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        background: '#fff',
        border: '2px solid #333',
        borderRadius: 8,
        padding: 16,
        zIndex: 9999,
        maxWidth: 300,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      }}
    >
      <h3 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700 }}>
        🐛 Logger Debug Panel
      </h3>

      <div style={{ fontSize: 12, marginBottom: 12 }}>
        <strong>User ID:</strong>
        <div
          style={{
            fontSize: 10,
            wordBreak: 'break-all',
            color: userId ? '#0a0' : '#a00',
          }}
        >
          {userId || 'Not initialized'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={testLog}
          disabled={!userId}
          style={{
            padding: '8px 12px',
            fontSize: 12,
            background: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: userId ? 'pointer' : 'not-allowed',
            opacity: userId ? 1 : 0.5,
          }}
        >
          Log Test Event
        </button>

        <button
          onClick={fetchLogs}
          disabled={!userId || loading}
          style={{
            padding: '8px 12px',
            fontSize: 12,
            background: '#2196F3',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: userId && !loading ? 'pointer' : 'not-allowed',
            opacity: userId && !loading ? 1 : 0.5,
          }}
        >
          {loading ? 'Loading...' : `Fetch Recent Logs (${logs.length})`}
        </button>

        <button
          onClick={clearLogs}
          disabled={!userId}
          style={{
            padding: '8px 12px',
            fontSize: 12,
            background: '#f44336',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: userId ? 'pointer' : 'not-allowed',
            opacity: userId ? 1 : 0.5,
          }}
        >
          Clear All Logs
        </button>
      </div>

      <div style={{ fontSize: 10, marginTop: 12, color: '#666' }}>
        💡 Open browser console to see logs
      </div>
    </div>
  );
}
