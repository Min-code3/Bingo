# 🧪 Logger Testing Guide

## ✅ Changes Made

I've added **console logging** to make the logger visible in development mode. Now you'll see:

- 🔐 When anonymous auth initializes
- 🟢 When GlobalLogger starts tracking
- 📊 Every click that gets logged
- ✅/❌ Success/failure of each log

## 🚀 Quick Test

### Step 1: Start the dev server
```bash
npm run dev
```

### Step 2: Open browser console (F12)

You should immediately see:
```
🔐 Initializing anonymous auth...
✅ Found existing session: [uuid] (or)
🔑 Creating new anonymous user...
✅ Anonymous user created: [uuid]
🟢 GlobalLogger: Initialized with userId: [uuid]
🎯 GlobalLogger: Click tracking active
📊 Logger: page_view → /
✅ Logged successfully
```

### Step 3: Click anywhere

Every click should show:
```
📊 Logger: click → button.upload-btn
✅ Logged successfully
```

### Step 4: Verify in Supabase

1. Go to Supabase Table Editor → `user_logs`
2. You should see rows appearing with your clicks

---

## 🐛 Debug Panel (Optional)

Want a visual test panel? Add this to your main page:

### Temporarily add to `app/page.tsx`:

```typescript
import LoggerDebugPanel from '@/components/LoggerDebugPanel';

export default function Home() {
  // ... existing code ...

  return (
    <>
      {/* Your existing JSX */}

      {/* Add this at the end */}
      {process.env.NODE_ENV === 'development' && <LoggerDebugPanel />}
    </>
  );
}
```

This adds a floating panel in the bottom-right with buttons to:
- ✅ Log a test event
- 📊 Fetch recent logs
- 🗑️ Clear all logs

**Remove it when you're done testing!**

---

## 🔍 What to Check

### Console Messages

**Good signs:**
```
✅ Anonymous user created: [uuid]
🟢 GlobalLogger: Initialized
📊 Logger: click → ...
✅ Logged successfully
```

**Warnings (need attention):**
```
❌ Failed to log event: [error]
🔴 Logger: No userId yet
```

### Common Issues

#### "No userId yet, skipping log"
- **Cause**: Anonymous auth hasn't finished initializing
- **Fix**: Wait 1-2 seconds after page load, then try clicking
- **Check**: Is anonymous sign-in enabled in Supabase?

#### "Failed to log event: new row violates row-level security policy"
- **Cause**: RLS policies not set up correctly
- **Fix**: Re-run the `supabase-schema.sql` script
- **Check**: Make sure the policy allows `anon` role to INSERT

#### "Failed to log event: relation 'user_logs' does not exist"
- **Cause**: Table not created yet
- **Fix**: Run `supabase-schema.sql` in Supabase SQL Editor

#### No console logs at all
- **Cause**: Not in development mode, or logger not initialized
- **Fix**: Make sure `NODE_ENV=development` (automatic with `npm run dev`)

---

## 🧹 Clean Up Console Logs

Once you verify it's working, you can remove the console logs by editing:

### `lib/logger.ts`
Remove or comment out the `console.log` statements

### `components/GlobalLogger.tsx`
Remove or comment out the `console.log` statements

### `components/useAnonymousUser.ts`
Remove or comment out the `console.log` statements

**Or keep them!** They only show in development mode, not in production.

---

## ✅ Verification Checklist

- [ ] Console shows: "Anonymous user created"
- [ ] Console shows: "GlobalLogger: Initialized"
- [ ] Console shows: "Logger: click" when you click
- [ ] Console shows: "Logged successfully" after each click
- [ ] Supabase table `user_logs` has rows
- [ ] Each row has correct `user_id`, `action_type`, `target`

---

## 🎯 Next Steps

Once verified:

1. **Keep the logger running** - it's silent in production
2. **Remove LoggerDebugPanel** if you added it
3. **Start collecting data** - just use the app normally
4. **Analyze later** using SQL queries from `LOGGER_SETUP.md`

---

That's it! Your logger is now running and visible. 🎉
