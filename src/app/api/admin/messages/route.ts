import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

function isAuthenticated(cookieStore: Awaited<ReturnType<typeof cookies>>): boolean {
  const token = cookieStore.get('admin_token');
  return !!token?.value;
}

export async function GET() {
  const cookieStore = await cookies();
  if (!isAuthenticated(cookieStore)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = messages.filter((m: any) => !m.isRead).length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = messages.filter(
      (m: any) => new Date(m.createdAt) >= today
    ).length;

    return NextResponse.json({
      messages,
      stats: {
        totalMessages: messages.length,
        unreadMessages: unreadCount,
        todayMessages: todayCount,
      },
    });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json(
      { messages: [], stats: { totalMessages: 0, unreadMessages: 0, todayMessages: 0 } }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies();
  if (!isAuthenticated(cookieStore)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, isRead } = await req.json();

    await prisma.contactMessage.update({
      where: { id },
      data: { isRead },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update message:', error);
    return NextResponse.json(
      { error: 'Failed to update' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies();
  if (!isAuthenticated(cookieStore)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    await prisma.contactMessage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete message:', error);
    return NextResponse.json(
      { error: 'Failed to delete' },
      { status: 500 }
    );
  }
}
