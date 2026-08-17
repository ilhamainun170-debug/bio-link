import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, checkRateLimit, recordFailedAttempt, resetRateLimit, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many failed attempts. Please wait ${rateCheck.waitSeconds} seconds before trying again.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const isValid = await verifyPassword(password);

    if (!isValid) {
      const record = recordFailedAttempt(ip);
      if (record.locked) {
        return NextResponse.json(
          { error: `Too many failed attempts. Cooldown active for ${record.waitSeconds} seconds.` },
          { status: 429 }
        );
      }
      return NextResponse.json({ error: 'Invalid password. Please check and try again.' }, { status: 401 });
    }

    // Success: reset rate limit & set session cookie
    resetRateLimit(ip);
    const token = createSessionToken();

    const response = NextResponse.json({ success: true, message: 'Authentication successful' });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
