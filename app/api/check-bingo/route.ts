import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { MAIN_LINES, KYOTO_LINES, CITIES } from '@/lib/constants';

interface CheckBingoParams {
  userId: string;
  cityId?: string;
}

/**
 * Check if a user has completed at least 2 bingo lines
 * GET /api/check-bingo?userId=xxx&cityId=kyoto
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

    // Query user_logs for successful photo uploads
    const { data: logs, error } = await supabase
      .from('user_logs')
      .select('metadata')
      .eq('custom_user_id', userId)
      .eq('action_type', 'photo_upload_success')
      .not('metadata->>box_number', 'is', null);

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user logs', details: error.message },
        { status: 500 }
      );
    }

    // Extract completed box numbers
    const completedBoxes = new Set<number>();
    logs?.forEach((log: any) => {
      const boxNumber = log.metadata?.box_number;
      if (boxNumber && typeof boxNumber === 'number') {
        completedBoxes.add(boxNumber);
      }
    });

    // Convert box numbers (1-9) to cell IDs
    const city = CITIES[cityId];
    if (!city) {
      return NextResponse.json(
        { error: `Invalid cityId: ${cityId}` },
        { status: 400 }
      );
    }

    const mainCells = city.mainCells;
    const completedCellIds = new Set<string>();

    completedBoxes.forEach((boxNum) => {
      const cellIndex = boxNum - 1; // box numbers are 1-based, array is 0-based
      if (cellIndex >= 0 && cellIndex < mainCells.length) {
        completedCellIds.add(mainCells[cellIndex].id);
      }
    });

    // Check how many bingo lines are completed
    const bingoLines = city.mainLines || MAIN_LINES;
    const completedLines: string[][] = [];

    bingoLines.forEach((line) => {
      if (line.every((cellId) => completedCellIds.has(cellId))) {
        completedLines.push(line);
      }
    });

    const lineCount = completedLines.length;
    const hasTwoLines = lineCount >= 2;

    return NextResponse.json({
      userId,
      cityId,
      completedBoxes: Array.from(completedBoxes).sort((a, b) => a - b),
      completedCellIds: Array.from(completedCellIds),
      lineCount,
      hasTwoLines,
      completedLines,
      message: hasTwoLines
        ? `✅ Congratulations! You completed ${lineCount} bingo lines!`
        : `⏳ Keep going! You have ${lineCount} line(s) completed. Need ${2 - lineCount} more.`,
    });
  } catch (error) {
    console.error('Error checking bingo:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
