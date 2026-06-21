import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { schedulingSettings } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const barbershopId = (session.user as any)?.barbershopId;
  if (!barbershopId) return NextResponse.json({ data: null });

  const [row] = await db.select().from(schedulingSettings)
    .where(eq(schedulingSettings.barbershopId, barbershopId))
    .limit(1);

  return NextResponse.json({ data: row || null });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const barbershopId = (session.user as any)?.barbershopId;
  if (!barbershopId) return NextResponse.json({ error: 'No barbershop' }, { status: 400 });

  const body = await req.json();

  // Upsert
  const existing = await db.select({ id: schedulingSettings.id })
    .from(schedulingSettings)
    .where(eq(schedulingSettings.barbershopId, barbershopId))
    .limit(1);

  const data = {
    barbershopId,
    bookingWindowDays: body.bookingWindowDays,
    minAdvanceMinutes: body.minAdvanceMinutes,
    allowClientCancel: body.allowClientCancel,
    cancelLimitHours: body.cancelLimitHours,
    requireConfirmation: body.requireConfirmation,
    autoConfirmMinutes: body.autoConfirmMinutes,
    slotDurationMinutes: body.slotDurationMinutes,
    breakBetweenMinutes: body.breakBetweenMinutes,
    maxBookingsPerDay: body.maxBookingsPerDay ?? null,
    maxBookingsPerSlot: body.maxBookingsPerSlot,
    onlineBookingEnabled: body.onlineBookingEnabled,
    onlineBookingUrlSlug: body.onlineBookingUrlSlug || null,
    requirePaymentOnline: body.requirePaymentOnline,
    depositPercent: body.depositPercent?.toString() || '0',
    waitlistEnabled: body.waitlistEnabled,
    allowReschedule: body.allowReschedule,
    rescheduleLimitHours: body.rescheduleLimitHours,
    askClientNotes: body.askClientNotes,
    requireClientPhone: body.requireClientPhone,
  };

  let result;
  if (existing[0]) {
    [result] = await db.update(schedulingSettings)
      .set(data)
      .where(eq(schedulingSettings.id, existing[0].id))
      .returning();
  } else {
    [result] = await db.insert(schedulingSettings).values(data).returning();
  }

  return NextResponse.json({ data: result });
}
