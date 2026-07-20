import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isAuthenticatedAdmin } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const isAuthed = isAuthenticatedAdmin(request.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? null);
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(
    {
      error: 'Upload API is disabled in this deployment environment.',
    },
    { status: 501 }
  );
}