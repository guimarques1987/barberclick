import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { services } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.barbershopId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const p = await params;
    const serviceId = p.id;

    await db
      .delete(services)
      .where(and(eq(services.id, serviceId), eq(services.barbershopId, (session.user as any).barbershopId)));

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
    const serviceId = p.id;
    const body = await req.json();

    const [updated] = await db
      .update(services)
      .set({
        name: body.name,
        durationMinutes: parseInt(body.durationMinutes),
        price: body.price,
        updatedAt: new Date()
      })
      .where(and(eq(services.id, serviceId), eq(services.barbershopId, (session.user as any).barbershopId)))
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
