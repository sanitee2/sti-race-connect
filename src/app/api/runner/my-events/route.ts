import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper function to determine event status
function getEventStatus(eventDate: Date): string {
  const now = new Date();
  const eventDateTime = new Date(eventDate);

  if (eventDateTime < now) {
    return "completed";
  } else if (eventDateTime.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000) {
    return "upcoming";
  } else {
    return "scheduled";
  }
}

// Helper function to format date for display
function formatEventDate(eventDate: Date): string {
  return eventDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper function to format time for display
function formatEventTime(eventDate: Date): string {
  return eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// GET /api/runner/my-events - Fetch events the runner is registered for
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
    if (session.user.role !== 'Runner') {
      return NextResponse.json(
        { error: 'Only runners can access this endpoint' },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // upcoming, completed, all

    // Fetch all registrations for this user
    const registrations = await prisma.participants.findMany({
      where: {
        user_id: session.user.id,
      },
      include: {
        event: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
            event_categories: {
              include: {
                category: {
                  include: {
                    participants: true,
                  },
                },
              },
            },
          },
        },
        category: {
          select: {
            id: true,
            category_name: true,
            description: true,
            target_audience: true,
          },
        },
      },
      orderBy: {
        event: {
          event_date: 'desc',
        },
      },
    });

    // Transform the data and filter by status if requested
    const transformedEvents = registrations
      .map(registration => {
        const event = registration.event;
        const eventStatus = getEventStatus(event.event_date);
        
        // Calculate total participants for this event
        const totalParticipants = event.event_categories.reduce(
          (total, eventCategory) => total + eventCategory.category.participants.length,
          0
        );

        return {
          id: event.id,
          title: event.event_name,
          description: event.description,
          date: formatEventDate(event.event_date),
          time: formatEventTime(event.event_date),
          location: event.location,
          status: eventStatus,
          organizer: event.creator.name,
          totalParticipants,
          cover_image: event.cover_image,
          
          // Registration specific data
          registration: {
            id: registration.id,
            categoryId: registration.category_id,
            categoryName: registration.category.category_name,
            registrationStatus: registration.registration_status,
            paymentStatus: registration.payment_status,
            registeredAt: registration.registered_at,
          },
          
          // Event date for filtering
          event_date: event.event_date,
        };
      })
      .filter(event => {
        if (!status || status === 'all') return true;
        if (status === 'upcoming') return event.status === 'upcoming' || event.status === 'scheduled';
        if (status === 'completed') return event.status === 'completed';
        return true;
      });

    // Separate events by status for easier frontend handling
    const upcomingEvents = transformedEvents.filter(event => 
      event.status === 'upcoming' || event.status === 'scheduled'
    );
    
    const completedEvents = transformedEvents.filter(event => 
      event.status === 'completed'
    );

    return NextResponse.json({
      all: transformedEvents,
      upcoming: upcomingEvents,
      completed: completedEvents,
      total: transformedEvents.length,
    });

  } catch (error) {
    console.error("Error fetching runner's events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
} 