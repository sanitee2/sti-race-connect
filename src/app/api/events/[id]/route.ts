import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { StaffRole } from '@prisma/client';

// Helper function to map frontend StaffRole enum to Prisma StaffRole enum
function mapStaffRoleToPrisma(frontendRole: string): StaffRole {
  switch (frontendRole) {
    case 'MARSHAL':
      return StaffRole.EventMarshal;
    case 'RACE_DIRECTOR':
      return StaffRole.Coordinator;
    case 'VOLUNTEER':
      return StaffRole.SubMarshal;
    case 'MEDICAL_STAFF':
      return StaffRole.SubMarshal;
    case 'SECURITY':
      return StaffRole.SubMarshal;
    case 'OTHER':
    default:
      return StaffRole.SubMarshal;
  }
}

// Helper function to map Prisma StaffRole enum to frontend StaffRole enum
function mapStaffRoleFromPrisma(prismaRole: StaffRole): string {
  switch (prismaRole) {
    case StaffRole.EventMarshal:
      return 'MARSHAL';
    case StaffRole.Coordinator:
      return 'RACE_DIRECTOR';
    case StaffRole.SubMarshal:
    default:
      return 'OTHER';
  }
}

// GET /api/events/[id] - Fetch single event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the current session for authorization
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user role to determine access permissions
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

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
        sponsors: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to view this event
    // Admins can view all events
    // Non-admins can only view events they created or are staff members of
    if (user.role !== 'Admin') {
      const isCreator = event.created_by === session.user.id;
      const isStaffMember = event.event_staff.some(staff => staff.user_id === session.user.id);
      
      if (!isCreator && !isStaffMember) {
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        );
      }
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
        image: eventCategory.category.category_image,
        has_slot_limit: eventCategory.category.has_slot_limit,
        slot_limit: eventCategory.category.slot_limit,
        price: eventCategory.category.price ? Number(eventCategory.category.price) : null,
        earlyBirdPrice: eventCategory.category.early_bird_price ? Number(eventCategory.category.early_bird_price) : null,
      })),
      cover_image: event.cover_image,
      gallery_images: event.gallery_images,
      cutOffTime: event.cut_off_time,
      gunStartTime: event.gun_start_time,
      registrationStartDate: event.registration_start_date ? event.registration_start_date.toISOString() : null,
      registrationEndDate: event.registration_end_date ? event.registration_end_date.toISOString() : null,
      isFreeEvent: event.is_free_event,
      price: event.price ? Number(event.price) : null,
      earlyBirdPrice: event.early_bird_price ? Number(event.early_bird_price) : null,
      earlyBirdEndDate: event.early_bird_end_date ? event.early_bird_end_date.toISOString() : null,
      has_slot_limit: event.has_slot_limit,
      slot_limit: event.slot_limit,
      organization_id: event.organization_id,
      event_staff: event.event_staff.map(staff => ({
        user_id: staff.user_id,
        role_in_event: mapStaffRoleFromPrisma(staff.role_in_event),
        responsibilities: staff.responsibilities,
        assigned_at: staff.assigned_at ? staff.assigned_at.toISOString() : null,
        user: staff.user
      })),
      sponsors: event.sponsors.map(sponsor => ({
        name: sponsor.name,
        logo_url: sponsor.logo_url,
        website: sponsor.website
      })),
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
      cover_image,
      gallery_images,
      isFreeEvent,
      price,
      earlyBirdPrice,
      earlyBirdEndDate,
      cutOffTime,
      gunStartTime,
      paymentMethods,
      organization_id,
      event_staff,
      sponsors,
      registrationStartDate,
      registrationEndDate
    } = body;

    // Check if event exists
    const existingEvent = await prisma.events.findUnique({
      where: { id },
      select: {
        created_by: true,
        event_staff: {
          select: {
            user_id: true,
          },
        },
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get user role
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    // Check if user has permission to edit
    // Admins can edit all events
    // Event creators can edit their events
    // Staff members can edit events they are assigned to
    const isCreator = existingEvent.created_by === session.user.id;
    const isStaffMember = existingEvent.event_staff.some(staff => staff.user_id === session.user.id);
    
    if (user?.role !== 'Admin' && !isCreator && !isStaffMember) {
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

    // Update event with transaction to handle all related data
    const updatedEvent = await prisma.$transaction(async (tx) => {
      // First, delete existing payment methods, staff, and sponsors
      await Promise.all([
        tx.payment_methods.deleteMany({
          where: { event_id: id }
        }),
        tx.event_staff.deleteMany({
          where: { event_id: id }
        }),
        tx.event_sponsors.deleteMany({
          where: { event_id: id }
        })
      ]);

      // Create new payment methods if provided and event is not free
      if (!isFreeEvent && paymentMethods && paymentMethods.length > 0) {
        await Promise.all(
          paymentMethods.map((method: any) =>
            tx.payment_methods.create({
              data: {
                event_id: id,
                name: method.name,
                type: method.type,
                value: method.value,
              },
            })
          )
        );
      }

      // Create new event staff if provided
      if (event_staff && event_staff.length > 0) {
        await Promise.all(
          event_staff.map((staff: any) =>
            tx.event_staff.create({
              data: {
                event_id: id,
                user_id: staff.user_id,
                role_in_event: mapStaffRoleToPrisma(staff.role_in_event),
                responsibilities: staff.responsibilities,
              },
            })
          )
        );
      }

      // Create new sponsors if provided
      if (sponsors && sponsors.length > 0) {
        await Promise.all(
          sponsors.map((sponsor: any) =>
            tx.event_sponsors.create({
              data: {
                event_id: id,
                name: sponsor.name,
                logo_url: sponsor.logo_url,
                website: sponsor.website,
              },
            })
          )
        );
      }

      // Update the event
      const updated = await tx.events.update({
        where: { id },
        data: {
          event_name: name,
          description: description || '',
          event_date: eventDateTime,
          location,
          target_audience: target_audience || '',
          cover_image: cover_image || null,
          gallery_images: gallery_images || [],
          is_free_event: isFreeEvent || false,
          price: price ? parseFloat(price) : null,
          early_bird_price: earlyBirdPrice ? parseFloat(earlyBirdPrice) : null,
          early_bird_end_date: earlyBirdEndDateTime || null,
          cut_off_time: cutOffTime ? new Date(cutOffTime) : null,
          gun_start_time: gunStartTime ? new Date(gunStartTime) : null,
          registration_start_date: registrationStartDate ? new Date(registrationStartDate) : null,
          registration_end_date: registrationEndDate ? new Date(registrationEndDate) : null,
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
          sponsors: true,
        },
      });

      return updated;
    });

    // Transform the response
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
      target_audience: updatedEvent.target_audience,
      cover_image: updatedEvent.cover_image,
      gallery_images: updatedEvent.gallery_images,
      isFreeEvent: updatedEvent.is_free_event,
      price: updatedEvent.price,
      earlyBirdPrice: updatedEvent.early_bird_price,
      earlyBirdEndDate: updatedEvent.early_bird_end_date,
      cutOffTime: updatedEvent.cut_off_time,
      gunStartTime: updatedEvent.gun_start_time,
      organization_id: updatedEvent.organization_id,
      event_staff: updatedEvent.event_staff.map((staff: any) => ({
        user_id: staff.user_id,
        role_in_event: mapStaffRoleFromPrisma(staff.role_in_event),
        responsibilities: staff.responsibilities,
        assigned_at: staff.assigned_at ? staff.assigned_at.toISOString() : null,
        user: staff.user
      })),
      sponsors: updatedEvent.sponsors.map((sponsor: any) => ({
        name: sponsor.name,
        logo_url: sponsor.logo_url,
        website: sponsor.website
      }))
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

    // Check if event exists
    const existingEvent = await prisma.events.findUnique({
      where: { id },
      select: {
        created_by: true,
        event_name: true,
        event_staff: {
          select: {
            user_id: true,
          },
        },
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get user role
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    // Check if user has permission to delete
    // Admins can delete all events
    // Event creators can delete their events
    // Staff members can delete events they are assigned to
    const isCreator = existingEvent.created_by === session.user.id;
    const isStaffMember = existingEvent.event_staff.some(staff => staff.user_id === session.user.id);
    
    if (user?.role !== 'Admin' && !isCreator && !isStaffMember) {
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