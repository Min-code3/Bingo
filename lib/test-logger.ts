/**
 * Test utility for the global logger
 * Run this in the browser console to test logging
 */

import { supabase } from './supabase';

/**
 * Fetch recent logs for the current user
 * Usage in browser console:
 *   import { testLogger } from '@/lib/test-logger'
 *   await testLogger.getRecentLogs()
 */
export const testLogger = {
  /**
   * Get recent logs for current user
   */
  async getRecentLogs(limit = 10) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('No user found. Please wait for anonymous auth to complete.');
      return [];
    }

    const { data, error } = await supabase
      .from('user_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching logs:', error);
      return [];
    }

    console.table(data);
    return data;
  },

  /**
   * Get click count for current user
   */
  async getClickCount() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('No user found.');
      return 0;
    }

    const { data, error } = await supabase
      .from('user_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('action_type', 'click');

    if (error) {
      console.error('Error fetching count:', error);
      return 0;
    }

    const count = (data as any)?.count || 0;
    console.log(`Total clicks: ${count}`);
    return count;
  },

  /**
   * Get current user ID
   */
  async getUserId() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('No user found.');
      return null;
    }

    console.log('User ID:', user.id);
    return user.id;
  },

  /**
   * Clear all logs for current user (for testing)
   */
  async clearLogs() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('No user found.');
      return;
    }

    const { error } = await supabase
      .from('user_logs')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing logs:', error);
      return;
    }

    console.log('All logs cleared for current user.');
  },

  /**
   * Get all action types for current user
   */
  async getActionTypes() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('No user found.');
      return [];
    }

    const { data, error } = await supabase
      .from('user_logs')
      .select('action_type')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching action types:', error);
      return [];
    }

    const types = [...new Set(data.map(d => d.action_type))];
    console.log('Action types:', types);
    return types;
  },
};

// For easy browser console access
if (typeof window !== 'undefined') {
  (window as any).testLogger = testLogger;
}
