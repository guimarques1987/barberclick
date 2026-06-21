import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { transactions } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const barbershopId = (session.user as any)?.barbershopId;
  if (!barbershopId) return NextResponse.json({ data: [] });

  const rows = await db.select().from(transactions)
    .where(eq(transactions.barbershopId, barbershopId))
    .orderBy(desc(transactions.transactionAt))
    .limit(100);

  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const barbershopId = (session.user as any)?.barbershopId;
  const body = await req.json();

  const [tx] = await db.insert(transactions).values({
    barbershopId,
    type: body.type || 'income',
    category: body.category || null,
    description: body.description || null,
    amount: body.amount,
    paymentMethod: body.paymentMethod || null,
  }).returning();

  return NextResponse.json({ data: tx }, { status: 201 });
}
