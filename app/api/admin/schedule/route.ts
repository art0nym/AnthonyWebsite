import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin, ADMIN_SESSION_COOKIE } from '@/lib/admin-auth';
import { saveSchedule, type ScheduleMonth } from '@/lib/site-content';

function isValidSchedule(schedule: unknown): schedule is ScheduleMonth[] {
  return Array.isArray(schedule) && schedule.every(month => {
    if (!month || typeof month !== 'object') {
      return false;
    }

    const typedMonth = month as ScheduleMonth;
    return (
      typeof typedMonth.month === 'string' &&
      typeof typedMonth.monthNumber === 'number' &&
      Array.isArray(typedMonth.events) &&
      typedMonth.events.every(event => (
        typeof event.name === 'string' &&
        typeof event.dates === 'string' &&
        (event.url === undefined || typeof event.url === 'string')
      )) &&
      (typedMonth.imageSrc === undefined || typedMonth.imageSrc === null || typeof typedMonth.imageSrc === 'string')
    );
  });
}

export async function PUT(request: NextRequest) {
  const isAuthed = isAuthenticatedAdmin(request.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? null);
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!isValidSchedule(body?.schedule)) {
    return NextResponse.json({ error: 'Invalid schedule payload' }, { status: 400 });
  }

  const schedule = [...body.schedule].sort((a, b) => a.monthNumber - b.monthNumber);
  await saveSchedule(schedule);

  return NextResponse.json({ ok: true, schedule });
}