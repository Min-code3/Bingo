-- Create user_logs table for tracking user interactions
CREATE TABLE IF NOT EXISTS user_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target TEXT,
  page_url TEXT,
  element_type TEXT,
  element_text TEXT,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_user_logs_user_id ON user_logs(user_id);

-- Create index on timestamp for time-based queries
CREATE INDEX IF NOT EXISTS idx_user_logs_timestamp ON user_logs(timestamp DESC);

-- Create index on action_type for filtering
CREATE INDEX IF NOT EXISTS idx_user_logs_action_type ON user_logs(action_type);

-- Enable Row Level Security (RLS)
ALTER TABLE user_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous and authenticated users to insert their own logs
CREATE POLICY "Users can insert own logs"
ON user_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow anonymous and authenticated users to read their own logs
CREATE POLICY "Users can read own logs"
ON user_logs
FOR SELECT
TO anon, authenticated
USING (auth.uid() = user_id);

-- Optional: Policy for admin to read all logs (if needed later)
-- CREATE POLICY "Admins can read all logs"
-- ON user_logs
-- FOR SELECT
-- TO authenticated
-- USING (auth.jwt() ->> 'role' = 'admin');

-- Add comment to table
COMMENT ON TABLE user_logs IS 'Stores user interaction logs for analytics';
