import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clients } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.barbershopId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const p = await params;
    const clientId = p.id;

    await db
      .delete(clients)
      .where(and(eq(clients.id, clientId), eq(clients.barbershopId, (session.user as any).barbershopId)));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.barbershopId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const p = await params;
    const clientId = p.id;
    const body = await req.json();

    const [updated] = await db
      .update(clients)
      .set({
        name: body.name,
        phone: body.phone,
        email: body.email,
        updatedAt: new Date()
      })
      .where(and(eq(clients.id, clientId), eq(clients.barbershopId, (session.user as any).barbershopId)))
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
