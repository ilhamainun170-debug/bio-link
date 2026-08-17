import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/png';

    // On Vercel or serverless, return high-efficiency Base64 Data URL
    if (process.env.VERCEL) {
      const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;
      return NextResponse.json({ success: true, url: base64Data });
    }

    // On local environment, save file to public/uploads
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const ext = file.name.split('.').pop() || 'png';
      const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = path.join(uploadsDir, filename);

      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${filename}`;
      return NextResponse.json({ success: true, url: publicUrl });
    } catch (fsErr) {
      console.warn('Local fs write fallback to data url:', fsErr);
      const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;
      return NextResponse.json({ success: true, url: base64Data });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
