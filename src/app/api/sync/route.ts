import { NextRequest, NextResponse } from 'next/server';
import { db, syncToPostgres, fetchFromPostgres } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await fetchFromPostgres();
    const data = db.get();
    return NextResponse.json({
      data,
      isCloudKV: true,
    });
  } catch (error) {
    console.error('Sync GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch database' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data } = body;

    if (!data || !data.profile || !Array.isArray(data.links) || !Array.isArray(data.categories)) {
      return NextResponse.json({ error: 'Invalid database payload' }, { status: 400 });
    }

    db.bulkSync(data);
    await syncToPostgres(data);

    return NextResponse.json({
      success: true,
      message: 'Database synced successfully to Neon PostgreSQL',
      isCloudKV: true,
    });
  } catch (error) {
    console.error('Sync POST error:', error);
    return NextResponse.json({ error: 'Failed to sync database' }, { status: 500 });
  }
}
