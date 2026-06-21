import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { appointments, clients, services, users } from '@/lib/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const barbershopId = (session.user as any)?.barbershopId;
  if (!barbershopId) return NextResponse.json({ data: [] });

  const rows = await db
    .select({
      id: appointments.id,
      startAt: appointments.startAt,
      endAt: appointments.endAt,
      status: appointments.status,
      finalPrice: appointments.finalPrice,
      clientNotes: appointments.clientNotes,
      clientName: clients.name,
      clientPhone: clients.phone,
      serviceName: services.name,
      userName: users.name,
    })
    .from(appointments)
    .leftJoin(clients, eq(appointments.clientId, clients.id))
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .leftJoin(users, eq(appointments.userId, users.id))
    .where(eq(appointments.barbershopId, barbershopId))
    .orderBy(desc(appointments.startAt))
    .limit(200);

  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const barbershopId = (session.user as any)?.barbershopId;
  const body = await req.json();

  // Find or create client
  let clientId: string | null = null;
  if (body.clientName) {
    const existing = await db.select().from(clients)
      .where(and(eq(clients.barbershopId, barbershopId), eq(clients.name, body.clientName)))
      .limit(1);
    if (existing[0]) {
      clientId = existing[0].id;
    } else {
      const [newClient] = await db.insert(clients).values({
        barbershopId,
        name: body.clientName,
        phone: body.clientPhone || null,
      }).returning();
      clientId = newClient.id;
    }
  }

  const startAt = body.startAt ? new Date(body.startAt) : new Date();
  const endAt = new Date(startAt.getTime() + 30 * 60 * 1000); // default 30 min

  const [appt] = await db.insert(appointments).values({
    barbershopId,
    clientId,
    startAt,
    endAt,
    status: body.status || 'confirmed',
    clientNotes: body.notes || null,
    source: 'manual',
  }).returning();

  return NextResponse.json({ data: appt }, { status: 201 });
}
