# Global Data Logger Setup

## ✅ Implementation Complete

The global data logger has been fully implemented and will silently track all user interactions in the background.

## 📊 What's Being Tracked

### Automatic Tracking
- **All Clicks**: Every click on any element (buttons, links, images, etc.)
- **Page Views**: Initial page load and SPA navigation
- **Element Details**: Tag name, class, ID, text content
- **Context**: Page URL, viewport size, scroll position, timestamp

### Data Structure
Each log entry includes:
- `user_id`: Anonymous user UUID from Supabase Auth
- `action_type`: Type of action (e.g., "click", "page_view")
- `target`: Description of what was clicked (e.g., "button.upload-btn")
- `page_url`: Full URL where the action occurred
- `element_type`: HTML tag name (e.g., "button", "a", "div")
- `element_text`: Text content of the element (max 100 chars)
- `metadata`: JSON object with additional context
- `timestamp`: Auto-generated server timestamp

## 🔧 Setup Instructions

### 1. Create the Database Table

Go to your Supabase SQL Editor and run the contents of `supabase-schema.sql`:

```
https://supabase.com/dashboard/project/twkevftvombrvnwrladk/sql
```

Copy and paste the entire SQL file contents, then click **RUN**.

This will:
- Create the `user_logs` table
- Add indexes for performance
- Set up Row Level Security (RLS) policies
- Allow users to insert and read their own logs

### 2. Verify the Table

After running the SQL:
1. Go to **Table Editor** in Supabase
2. You should see a new table: `user_logs`
3. The table will be empty initially

### 3. Test It

1. Start your dev server: `npm run dev`
2. Open the app in your browser
3. Click around the app
4. Go to Supabase → Table Editor → `user_logs`
5. You should see rows appearing with your clicks!

## 📝 Custom Event Logging

You can also log custom events in your code:

```typescript
import { logCustomEvent } from '@/lib/logger';
import { useBingoState } from '@/components/useBingoState';

function MyComponent() {
  const { userId } = useBingoState();

  const handleSpecialAction = () => {
    // Log a custom event
    logCustomEvent(userId, 'bingo_completed', {
      target: 'main_grid',
      metadata: {
        city: 'osaka',
        completion_time: Date.now(),
      },
    });
  };

  // ...
}
```

### Available Logging Functions

```typescript
// Log a custom event
logCustomEvent(userId, 'action_type', {
  target: 'optional_target',
  metadata: { custom: 'data' },
});

// Log a page view (already automatic)
logPageView(userId, '/custom/path');

// Log a click (already automatic)
logClick(userId, element);
```

## 🎯 Example Queries

Once you have data, you can analyze it with SQL queries:

### Count clicks per user
```sql
SELECT user_id, COUNT(*) as click_count
FROM user_logs
WHERE action_type = 'click'
GROUP BY user_id
ORDER BY click_count DESC;
```

### Most clicked elements
```sql
SELECT target, COUNT(*) as clicks
FROM user_logs
WHERE action_type = 'click'
GROUP BY target
ORDER BY clicks DESC
LIMIT 10;
```

### Page views over time
```sql
SELECT
  DATE_TRUNC('hour', timestamp) as hour,
  COUNT(*) as views
FROM user_logs
WHERE action_type = 'page_view'
GROUP BY hour
ORDER BY hour DESC;
```

### User journey for a specific user
```sql
SELECT
  timestamp,
  action_type,
  target,
  page_url
FROM user_logs
WHERE user_id = 'YOUR_USER_ID'
ORDER BY timestamp ASC;
```

## 🔒 Privacy & Security

- **Row Level Security**: Users can only see their own logs
- **Anonymous IDs**: User IDs are anonymous UUIDs, not personal information
- **Silent Failures**: If logging fails, it won't disrupt the user experience
- **Client-side Filtering**: Sensitive inputs are not logged (passwords, etc.)

## 🐛 Troubleshooting

### No logs appearing?
1. Check browser console for errors (only in development)
2. Verify the `user_logs` table exists in Supabase
3. Verify RLS policies are set correctly
4. Make sure anonymous auth is working (check userId in React DevTools)

### Logs not saving?
1. Check the RLS policies allow `anon` role to INSERT
2. Verify your Supabase anon key is correct in `.env.local`
3. Check Network tab for failed requests to Supabase

### Too many logs?
You can add filtering to skip certain elements:

Edit `components/GlobalLogger.tsx` and add skip conditions:

```typescript
// Skip logging for certain elements
if (
  element.classList.contains('no-log') ||
  element.closest('.no-log-zone')
) {
  return; // Skip logging
}
```

Then add `no-log` class to elements you want to skip:
```tsx
<div className="no-log-zone">
  {/* Clicks here won't be logged */}
</div>
```

## 📈 Future Enhancements

You could extend this logger to track:
- Form submissions
- Error events
- Upload success/failure
- Bingo completions
- Time spent on page
- Scroll depth
- Touch events (mobile)
- Search queries
- Filter selections

Just use the `logCustomEvent` function with your custom action types!

## 🚀 Production Considerations

Before deploying to production:

1. **Consider GDPR/Privacy Laws**: Add a cookie consent banner if required
2. **Data Retention**: Set up automatic deletion of old logs
3. **Rate Limiting**: Consider adding throttling for high-frequency events
4. **Analytics Dashboard**: Build a dashboard to visualize the data

Example: Auto-delete logs older than 90 days:
```sql
-- Run this as a scheduled job
DELETE FROM user_logs
WHERE timestamp < NOW() - INTERVAL '90 days';
```

---

That's it! Your global logger is now running silently in the background, collecting valuable user interaction data. 🎉
