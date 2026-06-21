import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const barbershopId = (session.user as any)?.barbershopId;
  if (!barbershopId) return NextResponse.json({ data: [] });

  const rows = await db.select({
    id: users.id, name: users.name, email: users.email,
    phone: users.phone, role: users.role, isActive: users.isActive,
    avatarUrl: users.avatarUrl, createdAt: users.createdAt,
  }).from(users)
    .where(eq(users.barbershopId, barbershopId))
    .orderBy(desc(users.createdAt));

  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const barbershopId = (session.user as any)?.barbershopId;
  const body = await req.json();

  const passwordHash = await bcrypt.hash(body.password, 10);

  const [staff] = await db.insert(users).values({
    barbershopId,
    name: body.name,
    email: body.email,
    passwordHash,
    phone: body.phone || null,
    role: body.role || 'barber',
    isActive: true,
  }).returning();

  const { passwordHash: _, ...safeStaff } = staff as any;
  return NextResponse.json({ data: safeStaff }, { status: 201 });
}
