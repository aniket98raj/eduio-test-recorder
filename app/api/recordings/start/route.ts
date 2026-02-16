// =============================================================================
// API: Start Recording Session
// POST /api/recordings/start
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chromium } from 'playwright';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description, startUrl } = body;

    // Validate input
    if (!userId || !name || !startUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, name, startUrl' },
        { status: 400 }
      );
    }

    // Create recording in database
    const recording = await prisma.recording.create({
      data: {
        userId,
        name,
        description,
        startUrl,
        status: 'recording',
      },
    });

    // Return recording session info
    return NextResponse.json({
      recordingId: recording.id,
      message: 'Recording session started. Use Playwright Codegen to record your flow.',
      codegenCommand: `npx playwright codegen ${startUrl}`,
    });

  } catch (error: any) {
    console.error('Error starting recording:', error);
    return NextResponse.json(
      { error: 'Failed to start recording', details: error.message },
      { status: 500 }
    );
  }
}
