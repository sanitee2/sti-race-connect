import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper function to determine event status
function getEventStatus(eventDate: Date): string {
  const now = new Date();
  const eventDateTime = new Date(eventDate);

  if (eventDateTime < now) {
    return "Completed";
  } else if (eventDateTime.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000) {
    return "Upcoming";
  } else {
    return "Scheduled";
  }
}

// GET /api/events - Fetch all events
export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch events with their categories and related data
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
        event_date: 'desc',
      },
    });

    // Transform the data to match the expected format
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
      has_slot_limit: event.has_slot_limit,
      slot_limit: event.slot_limit,
      cutOffTime: event.cut_off_time,
      gunStartTime: event.gun_start_time,
      registrationStartDate: event.registration_start_date,
      registrationEndDate: event.registration_end_date,
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
        image: eventCategory.category.category_image,
        has_slot_limit: eventCategory.category.has_slot_limit,
        slot_limit: eventCategory.category.slot_limit
      })),
      cover_image: event.cover_image,
      gallery_images: event.gallery_images,
    }));

    return NextResponse.json(transformedEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
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
      cover_image,
      gallery_images,
      isFreeEvent,
      price,
      earlyBirdPrice,
      earlyBirdEndDate,
      hasSlotLimit,
      slotLimit,
      cutOffTime,
      gunStartTime,
      paymentMethods,
      organization_id,
      event_staff,
      sponsors,
      registrationStartDate,
      registrationEndDate
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

    // Parse early bird end date if provided
    let earlyBirdEndDateTime: Date | undefined;
    if (earlyBirdEndDate) {
      earlyBirdEndDateTime = new Date(earlyBirdEndDate);
      if (isNaN(earlyBirdEndDateTime.getTime())) {
        return NextResponse.json(
          { error: 'Invalid early bird end date format' },
          { status: 400 }
        );
      }
    }

    // Parse registration dates if provided
    let registrationStartDateTime: Date | undefined;
    let registrationEndDateTime: Date | undefined;
    
    if (registrationStartDate) {
      registrationStartDateTime = new Date(registrationStartDate);
      if (isNaN(registrationStartDateTime.getTime())) {
        return NextResponse.json(
          { error: 'Invalid registration start date format' },
          { status: 400 }
        );
      }
    }
    
    if (registrationEndDate) {
      registrationEndDateTime = new Date(registrationEndDate);
      if (isNaN(registrationEndDateTime.getTime())) {
        return NextResponse.json(
          { error: 'Invalid registration end date format' },
          { status: 400 }
        );
      }
    }

    // Create event with transaction to ensure all related data is created
    const event = await prisma.$transaction(async (tx) => {
      // Create the event first
      const createdEvent = await tx.events.create({
        data: {
          event_name: name,
          description: description || '',
          event_date: eventDateTime,
          location,
          target_audience: target_audience || '',
          created_by: session.user.id,
          cover_image: cover_image || null,
          gallery_images: gallery_images || [],
          is_free_event: isFreeEvent || false,
          price: price ? parseFloat(price) : null,
          early_bird_price: earlyBirdPrice ? parseFloat(earlyBirdPrice) : null,
          early_bird_end_date: earlyBirdEndDateTime || null,
          has_slot_limit: hasSlotLimit || false,
          slot_limit: slotLimit ? parseInt(slotLimit) : null,
          cut_off_time: cutOffTime ? new Date(cutOffTime) : null,
          gun_start_time: gunStartTime ? new Date(gunStartTime) : null,
          registration_start_date: registrationStartDateTime || null,
          registration_end_date: registrationEndDateTime || null,
          organization_id: organization_id || null,
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

      // Create payment methods if provided and event is not free
      if (!isFreeEvent && paymentMethods && paymentMethods.length > 0) {
        await Promise.all(
          paymentMethods.map((method: any) =>
            tx.payment_methods.create({
              data: {
                event_id: createdEvent.id,
                name: method.name,
                type: method.type,
                value: method.value,
              },
            })
          )
        );
      }

      // Create event staff if provided
      if (event_staff && event_staff.length > 0) {
        await Promise.all(
          event_staff.map((staff: any) =>
            tx.event_staff.create({
              data: {
                event_id: createdEvent.id,
                user_id: staff.user_id,
                role_in_event: staff.role_in_event,
                responsibilities: staff.responsibilities,
              },
            })
          )
        );
      }

      // Create sponsors if provided
      if (sponsors && sponsors.length > 0) {
        await Promise.all(
          sponsors.map((sponsor: any) =>
            tx.event_sponsors.create({
              data: {
                event_id: createdEvent.id,
                name: sponsor.name,
                logo_url: sponsor.logo_url,
                website: sponsor.website,
              },
            })
          )
        );
      }

      return createdEvent;
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
      has_slot_limit: event.has_slot_limit,
      slot_limit: event.slot_limit,
      cutOffTime: event.cut_off_time,
      gunStartTime: event.gun_start_time,
      registrationStartDate: event.registration_start_date,
      registrationEndDate: event.registration_end_date,
      participants: 0,
      categories: [],
      cover_image: event.cover_image,
      gallery_images: event.gallery_images,
      isFreeEvent: event.is_free_event,
      price: event.price,
      earlyBirdPrice: event.early_bird_price,
      earlyBirdEndDate: event.early_bird_end_date,
      organization_id: event.organization_id,
      event_staff: [],
      sponsors: []
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