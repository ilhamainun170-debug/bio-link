import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

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
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 });
    }

    db.updateOverviewOrder(items);
    return NextResponse.json({ success: true, message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating overview order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
