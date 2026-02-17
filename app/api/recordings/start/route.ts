import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, startUrl } = body;

    if (!name || !startUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: name, startUrl' },
        { status: 400 }
      );
    }

    // Get or create a default system user
    let user = await prisma.user.findFirst({
      where: { email: 'system@eduio.io' }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'system@eduio.io',
          name: 'System User',
          password: 'not-used',
          role: 'admin',
        }
      });
    }

    // Create recording in database
    const recording = await prisma.recording.create({
      data: {
        userId: user.id,
        name,
        description,
        startUrl,
        status: 'recording',
      },
    });

    return NextResponse.json({
      recordingId: recording.id,
      message: 'Recording session started.',
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