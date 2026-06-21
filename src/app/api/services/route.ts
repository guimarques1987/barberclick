import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { services } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const barbershopId = (session.user as any)?.barbershopId;
  if (!barbershopId) return NextResponse.json({ data: [] });

  const rows = await db.select().from(services)
    .where(eq(services.barbershopId, barbershopId))
    .orderBy(services.sortOrder, desc(services.createdAt));

  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const barbershopId = (session.user as any)?.barbershopId;
  const body = await req.json();

  const [svc] = await db.insert(services).values({
    barbershopId,
    name: body.name,
    description: body.description || null,
    price: body.price || '0',
    durationMinutes: body.durationMinutes || 30,
    isActive: body.isActive ?? true,
    isOnlineAvailable: body.isOnlineAvailable ?? true,
  }).returning();

  return NextResponse.json({ data: svc }, { status: 201 });
}
