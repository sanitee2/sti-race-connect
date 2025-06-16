import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user with verification status
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        verification_status: true,
        verified_at: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      verification_status: user.verification_status,
      verified_at: user.verified_at,
      role: user.role,
    });

  } catch (error) {
    console.error('Error fetching verification status:', error);
    return NextResponse.json(
      { message: 'Error fetching verification status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 