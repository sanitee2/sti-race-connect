import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/events - Fetch all events
export async function GET(request: NextRequest) {
  try {
    const events = await prisma.events.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
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
        event_staff: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        event_date: 'asc',
      },
    });

    // Transform the data to match frontend expectations
    const transformedEvents = events.map(event => ({
      id: event.id,
      name: event.event_name,
      description: event.description,
      date: event.event_date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      time: event.event_date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      location: event.location,
      status: getEventStatus(event.event_date),
      target_audience: event.target_audience,
      created_by: event.creator.name,
      participants: event.event_categories.reduce(
        (total, eventCategory) => total + eventCategory.category.participants.length,
        0
      ),
      categories: event.event_categories.map(eventCategory => ({
        id: eventCategory.category.id,
        name: eventCategory.category.category_name,
        description: eventCategory.category.description,
        targetAudience: eventCategory.category.target_audience,
        participants: eventCategory.category.participants.length,
      })),
      cover_image: event.cover_image,
      gallery_images: event.gallery_images,
    }));

    return NextResponse.json(transformedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create new event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      date,
      time,
      location,
      target_audience,
    } = body;

    // Validate required fields
    if (!name || !date || !time || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return NextResponse.json(
        { error: 'Invalid time format. Please use HH:MM format.' },
        { status: 400 }
      );
    }

    // Combine date and time into a DateTime object
    const eventDateTime = new Date(`${date}T${time}:00`);
    if (isNaN(eventDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date or time format' },
        { status: 400 }
      );
    }

    const event = await prisma.events.create({
      data: {
        event_name: name,
        description: description || '',
        event_date: eventDateTime,
        location,
        target_audience: target_audience || '',
        created_by: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
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
    });

    // Transform the response to match frontend expectations
    const transformedEvent = {
      id: event.id,
      name: event.event_name,
      description: event.description,
      date: event.event_date.toISOString().split('T')[0],
      time: event.event_date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      location: event.location,
      status: getEventStatus(event.event_date),
      target_audience: event.target_audience,
      created_by: event.creator.name,
      participants: 0,
      categories: [],
      cover_image: event.cover_image,
      gallery_images: event.gallery_images,
    };

    return NextResponse.json(transformedEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

function getEventStatus(eventDate: Date): string {
  const now = new Date();
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (eventDay > today) {
    return 'Upcoming';
  } else if (eventDay.getTime() === today.getTime()) {
    return 'Active';
  } else {
    return 'Completed';
  }
} 