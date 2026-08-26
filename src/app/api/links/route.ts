import { NextRequest, NextResponse } from 'next/server';
import { db, syncToPostgres } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const links = db.getLinks();
    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, url, thumbnail_url, category_id, is_active } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!url || !url.trim()) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let validUrl = url.trim();
    if (!/^https?:\/\//i.test(validUrl) && !/^mailto:/i.test(validUrl) && !/^tel:/i.test(validUrl)) {
      validUrl = `https://${validUrl}`;
    }

    const created = db.createLink({
      title: title.trim(),
      url: validUrl,
      thumbnail_url: thumbnail_url?.trim() || null,
      category_id: category_id || null,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    });

    await syncToPostgres(db.get());

    return NextResponse.json({ success: true, link: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, url, thumbnail_url, category_id, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }

    let formattedUrl = url;
    if (url && typeof url === 'string') {
      const trimmed = url.trim();
      if (!/^https?:\/\//i.test(trimmed) && !/^mailto:/i.test(trimmed) && !/^tel:/i.test(trimmed)) {
        formattedUrl = `https://${trimmed}`;
      } else {
        formattedUrl = trimmed;
      }
    }

    const updated = db.updateLink(id, {
      ...(title !== undefined && { title: title.trim() }),
      ...(url !== undefined && { url: formattedUrl }),
      ...(thumbnail_url !== undefined && { thumbnail_url: thumbnail_url?.trim() || null }),
      ...(category_id !== undefined && { category_id: category_id || null }),
      ...(is_active !== undefined && { is_active: Boolean(is_active) }),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    await syncToPostgres(db.get());

    return NextResponse.json({ success: true, link: updated });
  } catch (error) {
    console.error('Error updating link:', error);
    return NextResponse.json({ error: 'Failed to update link' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }

    const deleted = db.deleteLink(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    await syncToPostgres(db.get());

    return NextResponse.json({ success: true, message: 'Link deleted' });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }
}
