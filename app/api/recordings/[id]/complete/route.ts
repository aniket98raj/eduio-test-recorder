// =============================================================================
// API: Complete Recording & Generate Test
// POST /api/recordings/[id]/complete
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { aiTestGenerator } from '@/lib/ai-generator';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordingId = params.id;
    const body = await request.json();
    const { playwrightCode, actions, screenshots } = body;

    // Validate input
    if (!playwrightCode) {
      return NextResponse.json(
        { error: 'Missing playwrightCode' },
        { status: 400 }
      );
    }

    // Get recording
    const recording = await prisma.recording.findUnique({
      where: { id: recordingId },
    });

    if (!recording) {
      return NextResponse.json(
        { error: 'Recording not found' },
        { status: 404 }
      );
    }

    // Update recording with code
    await prisma.recording.update({
      where: { id: recordingId },
      data: {
        playwrightCode,
        actions: JSON.stringify(actions || []),
        screenshots: JSON.stringify(screenshots || []),
        status: 'processing',
      },
    });

    // Generate AI test using Claude
    console.log('🤖 Generating AI test with Claude...');
    const generatedTest = await aiTestGenerator.generateTest({
      playwrightCode,
      actions: actions || [],
      screenshots: screenshots || [],
      startUrl: recording.startUrl || '',
      testName: recording.name,
      testDescription: recording.description || undefined,
    });

    // Save generated test
    const test = await prisma.generatedTest.create({
      data: {
        recordingId,
        userId: recording.userId,
        name: recording.name,
        testCode: generatedTest.testCode,
        filePath: `tests/ai-tests/${generatedTest.fileName}`,
        aiSummary: generatedTest.summary,
        detectedActions: JSON.stringify(generatedTest.detectedActions),
        suggestedAssertions: JSON.stringify(generatedTest.suggestedAssertions),
        status: 'pending',
      },
    });

    // Update recording status
    await prisma.recording.update({
      where: { id: recordingId },
      data: { status: 'completed' },
    });

    return NextResponse.json({
      success: true,
      testId: test.id,
      test: {
        name: test.name,
        code: test.testCode,
        summary: test.aiSummary,
        actions: generatedTest.detectedActions,
        assertions: generatedTest.suggestedAssertions,
      },
    });

  } catch (error: any) {
    console.error('Error generating test:', error);
    
    // Update recording status to failed
    try {
      await prisma.recording.update({
        where: { id: params.id },
        data: { status: 'failed' },
      });
    } catch {}

    return NextResponse.json(
      { error: 'Failed to generate test', details: error.message },
      { status: 500 }
    );
  }
}
