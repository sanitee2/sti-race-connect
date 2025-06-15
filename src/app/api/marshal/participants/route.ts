import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is a Marshal
    if (session.user.role !== 'Marshal') {
      return NextResponse.json(
        { error: 'Only marshals can access this endpoint' },
        { status: 403 }
      );
    }

    // Fetch participants for events created by this marshal
    const participants = await prisma.participants.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone_number: true,
          },
        },
        event: {
          select: {
            id: true,
            event_name: true,
            created_by: true,
          },
        },
        category: {
          select: {
            id: true,
            category_name: true,
          },
        },
      },
      where: {
        event: {
          created_by: session.user.id, // Only participants from marshal's events
        },
      },
      orderBy: {
        registered_at: 'desc',
      },
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error('Error fetching marshal participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 