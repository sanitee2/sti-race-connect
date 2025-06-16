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

    // Check if user is a Marshal or Admin
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !['Marshal', 'Admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Only marshals and admins can access this endpoint' },
        { status: 403 }
      );
    }

    // Get events where the user is either the creator or a staff member
    const events = await prisma.events.findMany({
      where: {
        OR: [
          { created_by: session.user.id }, // Events created by the marshal
          {
            event_staff: {
              some: {
                user_id: session.user.id, // Events where marshal is staff
              },
            },
          },
        ],
      },
      include: {
        event_categories: {
          include: {
            category: {
              include: {
                participants: {
                  where: {
                    registration_status: 'Approved',
                  },
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                    results: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        event_date: 'desc',
      },
    });

    // Transform the data for easier consumption by the frontend
    const transformedEvents = events.map(event => ({
      id: event.id,
      name: event.event_name,
      date: event.event_date,
      location: event.location,
      categories: event.event_categories.map(eventCategory => ({
        id: eventCategory.category.id,
        name: eventCategory.category.category_name,
        description: eventCategory.category.description,
        targetAudience: eventCategory.category.target_audience,
        gunStartTime: eventCategory.category.gun_start_time,
        cutOffTime: eventCategory.category.cut_off_time,
        participantsCount: eventCategory.category.participants.length,
        finishedCount: eventCategory.category.participants.filter(
          p => p.results && p.results.length > 0
        ).length,
        participants: eventCategory.category.participants.map(participant => ({
          id: participant.id,
          userId: participant.user_id,
          name: participant.user.name,
          email: participant.user.email,
          rfidNumber: participant.rfid_number,
          hasResult: participant.results && participant.results.length > 0,
          result: participant.results && participant.results.length > 0 ? {
            completionTime: participant.results[0].completion_time,
            ranking: participant.results[0].ranking,
            recordedAt: participant.results[0].recorded_at,
          } : null,
        })),
      })),
    }));

    return NextResponse.json({
      success: true,
      events: transformedEvents,
      totalEvents: transformedEvents.length,
    });

  } catch (error) {
    console.error('Error fetching marshal events and categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events and categories' },
      { status: 500 }
    );
  }
} 