import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // For now, we'll check for admin role later - focusing on functionality first
    // TODO: Add proper authentication check for admin role
    
    // Fetch all marshal applications
    const applications = await prisma.users.findMany({
      where: {
        role: 'Marshal',
      },
      include: {
        marshal_profile: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Group applications by status
    const grouped = {
      pending: applications.filter(app => app.verification_status === 'Pending'),
      approved: applications.filter(app => app.verification_status === 'Approved'),
      rejected: applications.filter(app => app.verification_status === 'Rejected'),
    };

    return NextResponse.json(grouped);
  } catch (error) {
    console.error('Error fetching marshal applications:', error);
    return NextResponse.json(
      { message: 'Error fetching marshal applications' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 