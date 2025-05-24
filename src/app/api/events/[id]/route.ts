import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/events/[id] - Fetch single event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await prisma.events.findUnique({
      where: { id },
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
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Transform the data to match frontend expectations
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
    };

    return NextResponse.json(transformedEvent);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update event
export async function PUT(
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

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      date,
      time,
      location,
      target_audience,
    } = body;

    // Check if event exists and user has permission to edit
    const existingEvent = await prisma.events.findUnique({
      where: { id },
      select: {
        created_by: true,
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (existingEvent.created_by !== session.user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

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

    const updatedEvent = await prisma.events.update({
      where: { id },
      data: {
        event_name: name,
        description: description || '',
        event_date: eventDateTime,
        location,
        target_audience: target_audience || '',
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
      id: updatedEvent.id,
      name: updatedEvent.event_name,
      description: updatedEvent.description,
      date: updatedEvent.event_date.toISOString().split('T')[0],
      time: updatedEvent.event_date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      location: updatedEvent.location,
      status: getEventStatus(updatedEvent.event_date),
      target_audience: updatedEvent.target_audience,
      created_by: updatedEvent.creator.name,
      participants: updatedEvent.event_categories.reduce(
        (total, eventCategory) => total + eventCategory.category.participants.length,
        0
      ),
      categories: updatedEvent.event_categories.map(eventCategory => ({
        id: eventCategory.category.id,
        name: eventCategory.category.category_name,
        description: eventCategory.category.description,
        targetAudience: eventCategory.category.target_audience,
        participants: eventCategory.category.participants.length,
      })),
      cover_image: updatedEvent.cover_image,
      gallery_images: updatedEvent.gallery_images,
    };

    return NextResponse.json(transformedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(
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

    const { id } = await params;

    // Check if event exists and user has permission to delete
    const existingEvent = await prisma.events.findUnique({
      where: { id },
      select: {
        created_by: true,
        event_name: true,
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (existingEvent.created_by !== session.user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Delete the event (cascade deletes will handle related data)
    await prisma.events.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Event deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
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