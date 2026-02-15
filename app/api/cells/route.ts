import { NextResponse } from 'next/server';
import { fetchAllCellImages } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchAllCellImages();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
    });
  } catch (e) {
    console.error('[api/cells] error:', e);
    return NextResponse.json({}, { status: 500 });
  }
}
