// =============================================================================
// API: Approve & Commit Test
// POST /api/tests/[id]/approve
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { gitService } from '@/lib/git-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const testId = params.id;
    const body = await request.json();
    const { approvedBy, reviewNotes, modifiedCode } = body;

    // Get test
    const test = await prisma.generatedTest.findUnique({
      where: { id: testId },
      include: { recording: true },
    });

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    // Use modified code if provided, otherwise use original
    const finalCode = modifiedCode || test.testCode;

    // Commit to git repository
    const commitMessage = `feat: Add AI-generated test - ${test.name}

Generated from recording: ${test.recording.name}
Approved by: ${approvedBy}
${reviewNotes ? `\nNotes: ${reviewNotes}` : ''}`;

    await gitService.commitGeneratedTest(
      test.filePath.split('/').pop() || 'test.spec.ts',
      finalCode,
      commitMessage
    );

    // Update test status
    await prisma.generatedTest.update({
      where: { id: testId },
      data: {
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
        reviewNotes,
        testCode: finalCode, // Save modified version if edited
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test approved and committed to repository',
    });

  } catch (error: any) {
    console.error('Error approving test:', error);
    return NextResponse.json(
      { error: 'Failed to approve test', details: error.message },
      { status: 500 }
    );
  }
}
