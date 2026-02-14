import { NextResponse } from 'next/server';
import { fetchFoodPlaces } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchFoodPlaces();
    return NextResponse.json(data);
  } catch (e) {
    console.error('[api/food-places] error:', e);
    return NextResponse.json([], { status: 500 });
  }
}
