import { NextResponse } from 'next/server';
import { fetchMainPlaces } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchMainPlaces();
    return NextResponse.json(data);
  } catch (e) {
    console.error('[api/main-places] error:', e);
    return NextResponse.json([], { status: 500 });
  }
}
