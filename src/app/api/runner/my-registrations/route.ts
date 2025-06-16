import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is a Runner
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== 'Runner') {
      return NextResponse.json(
        { error: 'Only runners can access this endpoint' },
        { status: 403 }
      );
    }

    // Fetch user's registrations
    const registrations = await prisma.participants.findMany({
      where: {
        user_id: session.user.id,
      },
      include: {
        event: {
          select: {
            id: true,
            event_name: true,
            event_date: true,
            location: true,
          },
        },
        category: {
          select: {
            id: true,
            category_name: true,
          },
        },
      },
      orderBy: [
        { event: { event_date: 'desc' } },
        { registered_at: 'desc' },
      ],
    });

    // Transform the data for frontend consumption
    const transformedRegistrations = registrations.map(registration => ({
      id: registration.id,
      event: {
        id: registration.event.id,
        name: registration.event.event_name,
        date: registration.event.event_date.toISOString(),
        location: registration.event.location,
      },
      category: {
        id: registration.category.id,
        name: registration.category.category_name,
      },
      registrationStatus: registration.registration_status,
      paymentStatus: registration.payment_status,
      hasQRCode: !!(registration.qr_code_url && registration.qr_code_data),
      qrCodeUrl: registration.qr_code_url,
      qrCodeData: registration.qr_code_data,
      registrationDate: registration.registered_at.toISOString(),
      verifiedAt: registration.verified_at?.toISOString() || null,
      rejectionReason: registration.rejection_reason,
    }));

    return NextResponse.json({
      registrations: transformedRegistrations,
    });

  } catch (error) {
    console.error('Error fetching user registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
} 