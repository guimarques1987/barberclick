import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.barbershopId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const p = await params;
    const staffId = p.id;

    // Previne que o admin apague a si mesmo
    if (staffId === session.user.id) {
      return NextResponse.json({ error: 'Você não pode excluir a sua própria conta.' }, { status: 400 });
    }

    await db
      .delete(users)
      .where(and(eq(users.id, staffId), eq(users.barbershopId, (session.user as any).barbershopId)));

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
    const staffId = p.id;
    const body = await req.json();

    const [updated] = await db
      .update(users)
      .set({
        name: body.name,
        email: body.email,
        phone: body.phone,
        updatedAt: new Date()
      })
      .where(and(eq(users.id, staffId), eq(users.barbershopId, (session.user as any).barbershopId)))
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
