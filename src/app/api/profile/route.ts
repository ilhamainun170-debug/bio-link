import { NextRequest, NextResponse } from 'next/server';
import { db, syncToPostgres } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = db.getProfile();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, socials } = body;

    const updated = db.updateProfile(profile || {}, socials);
    await syncToPostgres(db.get());

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
