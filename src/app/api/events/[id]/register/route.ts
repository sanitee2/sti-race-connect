import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/events/[id]/register - Register for an event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { error: 'Only runners can register for events' },
        { status: 403 }
      );
    }

    const { id: eventId } = await params;
    const body = await request.json();
    const { categoryId } = body; // Required: specific category to register for

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required for registration' },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      include: {
        event_categories: {
          include: {
            category: true,
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

    // Check if event is still upcoming
    if (event.event_date < new Date()) {
      return NextResponse.json(
        { error: 'Cannot register for past events' },
        { status: 400 }
      );
    }

    // Verify that the category exists for this event
    const eventCategory = event.event_categories.find(
      ec => ec.category.id === categoryId
    );

    if (!eventCategory) {
      return NextResponse.json(
        { error: 'Category not available for this event' },
        { status: 400 }
      );
    }

    // Check if user is already registered for this event and category
    const existingRegistration = await prisma.participants.findFirst({
      where: {
        user_id: session.user.id,
        event_id: eventId,
        category_id: categoryId,
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Already registered for this event category' },
        { status: 400 }
      );
    }

    // Create the registration
    const registration = await prisma.participants.create({
      data: {
        user_id: session.user.id,
        event_id: eventId,
        category_id: categoryId,
        registration_status: 'Pending', // Set to Pending for marshal approval
        payment_status: 'Pending', // Payment can be handled separately
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            category_name: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Successfully registered for event',
      registration: {
        id: registration.id,
        eventId: eventId,
        categoryId: registration.category_id,
        categoryName: registration.category.category_name,
        registrationStatus: registration.registration_status,
        paymentStatus: registration.payment_status,
        registrationDate: registration.registered_at,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    );
  }
}

// GET /api/events/[id]/register - Check registration status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: eventId } = await params;

    // Check if user is registered for this specific event
    const registrations = await prisma.participants.findMany({
      where: {
        user_id: session.user.id,
        event_id: eventId,
      },
      include: {
        category: {
          select: {
            id: true,
            category_name: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      isRegistered: registrations.length > 0,
      registrations: registrations.map(reg => ({
        id: reg.id,
        categoryId: reg.category_id,
        categoryName: reg.category.category_name,
        registrationStatus: reg.registration_status,
        paymentStatus: reg.payment_status,
        registrationDate: reg.registered_at,
      })),
    });

  } catch (error) {
    console.error('Error checking registration status:', error);
    return NextResponse.json(
      { error: 'Failed to check registration status' },
      { status: 500 }
    );
  }
} 