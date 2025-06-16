import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/events/[id]/participants - Fetch participants for a specific event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const eventId = resolvedParams.id;

    // Verify the event exists and user has access to it
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      select: { 
        id: true, 
        event_name: true,
        created_by: true,
        event_staff: {
          select: {
            user_id: true
          }
        }
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this event (creator or staff member)
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isCreator = event.created_by === session.user.id;
    const isStaff = event.event_staff.some(staff => staff.user_id === session.user.id);
    const isAdmin = user?.role === 'Admin';

    if (!isCreator && !isStaff && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Fetch participants for this event
    const participants = await prisma.participants.findMany({
      where: {
        event_id: eventId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            runner_profile: {
              select: {
                date_of_birth: true,
                gender: true,
                tshirt_size: true,
                emergency_contact_name: true,
                emergency_contact_phone: true,
              }
            },
            marshal_profile: {
              select: {
                date_of_birth: true,
                gender: true,
              }
            }
          },
        },
        category: {
          select: {
            id: true,
            category_name: true,
            target_audience: true,
          },
        },
      },
      orderBy: [
        { category: { category_name: 'asc' } },
        { user: { name: 'asc' } },
      ],
    });

    // Transform the data for frontend consumption
    const transformedParticipants = participants.map(participant => ({
      id: participant.id,
      user: {
        id: participant.user.id,
        name: participant.user.name,
        email: participant.user.email,
        phone: participant.user.phone,
        address: participant.user.address,
        dateOfBirth: participant.user.runner_profile?.date_of_birth || participant.user.marshal_profile?.date_of_birth,
        gender: participant.user.runner_profile?.gender || participant.user.marshal_profile?.gender,
        tshirtSize: participant.user.runner_profile?.tshirt_size,
        emergencyContact: participant.user.runner_profile ? {
          name: participant.user.runner_profile.emergency_contact_name,
          phone: participant.user.runner_profile.emergency_contact_phone,
        } : undefined,
      },
      category: {
        id: participant.category.id,
        name: participant.category.category_name,
        targetAudience: participant.category.target_audience,
      },
      rfidNumber: participant.rfid_number,
      registrationStatus: participant.registration_status,
      paymentStatus: participant.payment_status,
      registrationDate: participant.registered_at,
      hasQRCode: !!(participant.qr_code_url && participant.qr_code_data),
      qrCodeUrl: participant.qr_code_url,
      qrCodeData: participant.qr_code_data,
    }));

    // Group participants by category for easier display
    const participantsByCategory = transformedParticipants.reduce((acc, participant) => {
      const categoryName = participant.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = {
          category: participant.category,
          participants: [],
        };
      }
      acc[categoryName].participants.push(participant);
      return acc;
    }, {} as Record<string, { category: any; participants: any[] }>);

    return NextResponse.json({
      eventName: event.event_name,
      totalParticipants: transformedParticipants.length,
      participantsByCategory,
      allParticipants: transformedParticipants,
    });
  } catch (error) {
    console.error('Error fetching event participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
} 