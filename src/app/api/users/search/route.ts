import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (q.length < 3) {
    return NextResponse.json([], { status: 200 });
  }

  const users = await prisma.users.findMany({
    where: {
      name: {
        contains: q,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    take: 10,
  });

  return NextResponse.json(users);
} 