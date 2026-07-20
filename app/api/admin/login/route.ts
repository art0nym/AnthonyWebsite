import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_PASSWORD,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TOKEN,
  ADMIN_USERNAME,
  isValidAdminCredentials,
} from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === 'string' ? body.username.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!isValidAdminCredentials(username, password)) {
    return NextResponse.json(
      {
        error: 'Invalid username or password.',
      },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    ok: true,
    username: ADMIN_USERNAME,
    passwordConfigured: ADMIN_PASSWORD.length > 0,
  });

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: ADMIN_SESSION_TOKEN,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}