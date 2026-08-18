import { NextRequest, NextResponse } from 'next/server';
import { db, isKVConfigured, fetchFromKV } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // If KV is configured, attempt to pull latest cloud state
    if (isKVConfigured()) {
      await fetchFromKV();
    }

    const data = db.get();
    return NextResponse.json({
      data,
      isCloudKV: isKVConfigured(),
    });
  } catch (error) {
    console.error('Sync GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch database' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { data } = body;

    if (!data || !Array.isArray(data.links) || !Array.isArray(data.categories)) {
      return NextResponse.json({ error: 'Invalid database payload' }, { status: 400 });
    }

    db.bulkSync(data);

    return NextResponse.json({
      success: true,
      message: 'Database synced successfully',
      isCloudKV: isKVConfigured(),
    });
  } catch (error) {
    console.error('Sync POST error:', error);
    return NextResponse.json({ error: 'Failed to sync database' }, { status: 500 });
  }
}
