import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from './db';

const SESSION_COOKIE_NAME = 'biolink_admin_session';
const SESSION_SECRET = 'biolink-secure-session-key-2026';

// In-memory rate limiting for brute force prevention (5 attempts max, 60s cooldown)
interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
}
const ipRateLimits = new Map<string, RateLimitRecord>();

export function checkRateLimit(ip: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const record = ipRateLimits.get(ip);

  if (!record) {
    return { allowed: true };
  }

  if (record.lockedUntil > now) {
    const remaining = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, waitSeconds: remaining };
  }

  if (record.lockedUntil <= now && record.lockedUntil !== 0) {
    // Lock expired, reset
    ipRateLimits.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedAttempt(ip: string): { locked: boolean; waitSeconds?: number } {
  const now = Date.now();
  const record = ipRateLimits.get(ip) || { attempts: 0, lockedUntil: 0 };
  record.attempts += 1;

  if (record.attempts >= 5) {
    record.lockedUntil = now + 60 * 1000; // 60s lock
    ipRateLimits.set(ip, record);
    return { locked: true, waitSeconds: 60 };
  }

  ipRateLimits.set(ip, record);
  return { locked: false };
}

export function resetRateLimit(ip: string): void {
  ipRateLimits.delete(ip);
}

export async function verifyPassword(password: string): Promise<boolean> {
  const data = db.get();
  const storedHash = data.settings?.admin_password_hash;
  if (!storedHash) return false;
  return bcrypt.compare(password, storedHash);
}

export function createSessionToken(): string {
  const timestamp = Date.now();
  const raw = `${SESSION_SECRET}:${timestamp}:${Math.random().toString(36).substring(2)}`;
  return Buffer.from(raw).toString('base64');
}

export function verifySessionToken(token?: string | null): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [secret, timestampStr] = decoded.split(':');
    if (secret !== SESSION_SECRET) return false;
    const timestamp = parseInt(timestampStr, 10);
    // Session valid for 7 days
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > maxAge) return false;
    return true;
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  return verifySessionToken(sessionCookie?.value);
}

export { SESSION_COOKIE_NAME };
