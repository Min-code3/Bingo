import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Check if a user's bingo video is ready and return the URL
 * GET /api/video?userId=xxx&cityId=kyoto
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const cityId = searchParams.get('cityId') || 'kyoto';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Expected filename: {userId}_bingo_{cityId}.mp4
    const fileName = `${userId}_bingo_${cityId}.mp4`;

    // Check if file exists in Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('videos')
      .list('', {
        search: fileName,
      });

    if (error) {
      console.error('Supabase storage error:', error);
      return NextResponse.json(
        { error: 'Failed to check video storage', details: error.message },
        { status: 500 }
      );
    }

    // Check if file exists
    const fileExists = data && data.length > 0 && data.some(file => file.name === fileName);

    if (!fileExists) {
      return NextResponse.json({
        ready: false,
        videoUrl: null,
        message: 'Video not ready yet',
      });
    }

    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('videos')
      .getPublicUrl(fileName);

    return NextResponse.json({
      ready: true,
      videoUrl: urlData.publicUrl,
      fileName,
      message: 'Video is ready!',
    });
  } catch (error) {
    console.error('Error checking video:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
