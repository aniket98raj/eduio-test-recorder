// =============================================================================
// Health Check Endpoint
// GET /api/health
// =============================================================================

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check environment variables
    const checks = {
      database: true,
      geminiApi: !!process.env.MIDSCENE_MODEL_API_KEY,
      gitRepo: !!process.env.GIT_REPO_PATH,
    };

    const allHealthy = Object.values(checks).every(v => v === true);

    return NextResponse.json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    }, {
      status: allHealthy ? 200 : 503,
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    }, {
      status: 503,
    });
  }
}
