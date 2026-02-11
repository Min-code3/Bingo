# Supabase Integration Setup

## ✅ Completed Steps

1. ✅ Installed `@supabase/supabase-js`
2. ✅ Created `.env.local` with proper Next.js environment variables
3. ✅ Created Supabase client (`lib/supabase.ts`)
4. ✅ Created `useAnonymousUser` hook for stable anonymous user IDs
5. ✅ Created upload utilities (`lib/upload-utils.ts`)
6. ✅ Updated `UploadButton` to support Supabase uploads
7. ✅ Integrated anonymous auth into `BingoProvider`
8. ✅ Updated all pages to pass `userId` to upload components

## 🔧 Required: Create Storage Bucket

You need to create a storage bucket named `user-uploads` in your Supabase dashboard:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/twkevftvombrvnwrladk
2. Click **Storage** in the left sidebar
3. Click **New bucket** button
4. Enter bucket name: `user-uploads`
5. **IMPORTANT**: Set the bucket to **Public** (toggle the Public switch ON)
6. Click **Create bucket**

### Option 2: Using SQL

Alternatively, run this SQL in your Supabase SQL Editor:

```sql
-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true);

-- Allow anonymous users to upload files
CREATE POLICY "Allow anonymous uploads"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'user-uploads');

-- Allow public read access
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'user-uploads');

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'user-uploads');
```

## 🔄 How It Works

1. **Anonymous Authentication**: When users first visit the app, they're automatically signed in anonymously via Supabase Auth, receiving a stable UUID
2. **Photo Upload Flow**:
   - User selects a photo
   - Photo is resized to 400px (existing logic)
   - If `userId` is available, photo is uploaded to Supabase Storage at path: `{userId}/{prefix}_{timestamp}_{random}.{ext}`
   - Public URL is returned and saved to state (instead of base64)
   - If Supabase upload fails, it falls back to base64 (backwards compatible)
3. **File Organization**: Files are organized by user ID in the bucket, with prefixes like `main` or `food`

## 🧪 Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the app and try uploading a photo
3. Check the browser console for any errors
4. Verify in Supabase Storage dashboard that files are being uploaded
5. Verify that the photos display correctly in the app

## 🐛 Troubleshooting

### Photos not uploading?
- Check browser console for errors
- Verify the storage bucket is **Public**
- Verify the bucket is named exactly `user-uploads`
- Check that anonymous sign-in is enabled in Supabase Auth settings

### Anonymous auth not working?
- Go to Supabase Dashboard → Authentication → Providers
- Make sure **Anonymous sign-in** is enabled

### CORS errors?
- Supabase should handle CORS automatically
- If issues persist, check your Supabase project's allowed origins

## 📝 Environment Variables

Make sure `.env.local` exists with:
```
NEXT_PUBLIC_SUPABASE_URL=https://twkevftvombrvnwrladk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note**: `.env.local` is already gitignored, so your keys are safe.

## 🎯 Next Steps

After creating the storage bucket, your app will automatically:
- Create anonymous users on first visit
- Upload photos to Supabase Storage instead of storing base64 in localStorage
- Store only the public URLs in your app state (much more efficient!)

The old base64 photos in localStorage will still work - the system is backwards compatible.
