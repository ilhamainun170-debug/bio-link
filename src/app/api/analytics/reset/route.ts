import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function POST() {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    db.resetAnalytics();
    return NextResponse.json({ success: true, message: 'Analytics reset successfully' });
  } catch (error) {
    console.error('Error resetting analytics:', error);
    return NextResponse.json({ error: 'Failed to reset analytics' }, { status: 500 });
  }
}
