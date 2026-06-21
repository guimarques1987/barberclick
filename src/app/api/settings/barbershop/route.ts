import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbershops, workingHours } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const barbershopId = (session.user as any)?.barbershopId;
  if (!barbershopId) return NextResponse.json({ data: null });

  const [barbershop] = await db.select().from(barbershops).where(eq(barbershops.id, barbershopId)).limit(1);
  const hours = await db.select().from(workingHours)
    .where(eq(workingHours.barbershopId, barbershopId));

  return NextResponse.json({ data: { barbershop: barbershop || null, hours } });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const barbershopId = (session.user as any)?.barbershopId;
  if (!barbershopId) return NextResponse.json({ error: 'No barbershop' }, { status: 400 });

  const body = await req.json();
  const { barbershop: bData, hours: hData } = body;

  // Update barbershop
  await db.update(barbershops).set({
    name: bData.name,
    phone: bData.phone || null,
    email: bData.email || null,
    address: bData.address || null,
    city: bData.city || null,
    state: bData.state || null,
    zipCode: bData.zipCode || null,
    description: bData.description || null,
  }).where(eq(barbershops.id, barbershopId));

  // Upsert working hours
  if (hData?.length) {
    await db.delete(workingHours).where(eq(workingHours.barbershopId, barbershopId));
    await db.insert(workingHours).values(
      hData.map((h: any) => ({
        barbershopId,
        dayOfWeek: h.dayOfWeek,
        isOpen: h.isOpen,
        openTime: h.openTime,
        closeTime: h.closeTime,
        hasBreak: h.hasBreak,
        breakStart: h.hasBreak ? h.breakStart : null,
        breakEnd: h.hasBreak ? h.breakEnd : null,
      }))
    );
  }

  return NextResponse.json({ success: true });
}
