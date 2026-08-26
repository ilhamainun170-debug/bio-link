import { NextRequest, NextResponse } from 'next/server';
import { db, syncToPostgres } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = db.getOverviewItems();
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching overview items:', error);
    return NextResponse.json({ error: 'Failed to fetch overview items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 });
    }

    db.updateOverviewOrder(items);
    await syncToPostgres(db.get());

    return NextResponse.json({ success: true, message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating overview order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
