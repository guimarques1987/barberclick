import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { systemSettings } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const barbershopId = (session.user as any)?.barbershopId;
  if (!barbershopId) return NextResponse.json({ data: null });

  const [row] = await db.select().from(systemSettings)
    .where(eq(systemSettings.barbershopId, barbershopId)).limit(1);

  return NextResponse.json({ data: row || null });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const barbershopId = (session.user as any)?.barbershopId;
  if (!barbershopId) return NextResponse.json({ error: 'No barbershop' }, { status: 400 });

  const body = await req.json();
  const existing = await db.select({ id: systemSettings.id })
    .from(systemSettings).where(eq(systemSettings.barbershopId, barbershopId)).limit(1);

  const data = {
    barbershopId,
    notifyNewBooking: body.notifyNewBooking,
    notifyCancellation: body.notifyCancellation,
    notifyReminder: body.notifyReminder,
    reminderHoursBefore: body.reminderHoursBefore,
    whatsappEnabled: body.whatsappEnabled,
    whatsappNumber: body.whatsappNumber || null,
    emailEnabled: body.emailEnabled,
    emailFrom: body.emailFrom || null,
    primaryColor: body.primaryColor || '#6366F1',
    language: body.language || 'pt-BR',
  };

  let result;
  if (existing[0]) {
    [result] = await db.update(systemSettings).set(data).where(eq(systemSettings.id, existing[0].id)).returning();
  } else {
    [result] = await db.insert(systemSettings).values(data).returning();
  }

  return NextResponse.json({ data: result });
}
