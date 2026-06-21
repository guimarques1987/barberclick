import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { clients } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const barbershopId = (session.user as any)?.barbershopId;
  if (!barbershopId) return NextResponse.json({ data: [] });

  const rows = await db.select().from(clients)
    .where(eq(clients.barbershopId, barbershopId))
    .orderBy(desc(clients.createdAt));

  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const barbershopId = (session.user as any)?.barbershopId;
  const body = await req.json();

  const [client] = await db.insert(clients).values({
    barbershopId,
    name: body.name,
    phone: body.phone || null,
    email: body.email || null,
    birthDate: body.birthDate || null,
    notes: body.notes || null,
  }).returning();

  return NextResponse.json({ data: client }, { status: 201 });
}
