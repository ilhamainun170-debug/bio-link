import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { link_id } = body;

    if (!link_id) {
      return NextResponse.json({ error: 'link_id is required' }, { status: 400 });
    }

    const referrer = req.headers.get('referer') || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;

    const recorded = db.trackClick(link_id, {
      referrer,
      user_agent: userAgent,
    });

    if (!recorded) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Click tracked' });
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 });
  }
}
