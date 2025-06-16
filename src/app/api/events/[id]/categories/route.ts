import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/events/[id]/categories - Add category to event
export async function POST(
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

    const { id: eventId } = await params;
    const body = await request.json();
    const { 
      name, 
      description, 
      targetAudience, 
      image,
      hasSlotLimit,
      slotLimit,
      price,
      earlyBirdPrice,
      gunStartTime
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Validate slot limit if enabled
    if (hasSlotLimit && (!slotLimit || slotLimit <= 0)) {
      return NextResponse.json(
        { error: 'Valid slot limit is required when slot limit is enabled' },
        { status: 400 }
      );
    }

    // Check if event exists and user has permission
    const event = await prisma.events.findUnique({
      where: { id: eventId },
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

    if (!event) {
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

    // Check if user has permission to add categories
    // Admins can add categories to all events
    // Event creators can add categories to their events
    // Staff members can add categories to events they are assigned to
    const isCreator = event.created_by === session.user.id;
    const isStaffMember = event.event_staff.some(staff => staff.user_id === session.user.id);
    
    if (user?.role !== 'Admin' && !isCreator && !isStaffMember) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Create the category
    const category = await prisma.event_categories.create({
      data: {
        category_name: name,
        description: description || '',
        target_audience: targetAudience || '',
        category_image: image || null,
        created_by: session.user.id,
        has_slot_limit: hasSlotLimit || false,
        slot_limit: hasSlotLimit && slotLimit ? parseInt(slotLimit.toString()) : null,
        price: price ? parseFloat(price.toString()) : null,
        early_bird_price: earlyBirdPrice ? parseFloat(earlyBirdPrice.toString()) : null,
        gun_start_time: gunStartTime ? new Date(gunStartTime) : null,
      },
    });

    // Link the category to the event
    await prisma.event_to_category.create({
      data: {
        event_id: eventId,
        category_id: category.id,
      },
    });

    // Transform the response
    const transformedCategory = {
      id: category.id,
      name: category.category_name,
      description: category.description,
      targetAudience: category.target_audience,
      participants: 0,
      image: category.category_image,
      hasSlotLimit: category.has_slot_limit,
      slotLimit: category.slot_limit,
      price: category.price,
      earlyBirdPrice: category.early_bird_price,
      gunStartTime: category.gun_start_time,
    };

    return NextResponse.json(transformedCategory, { status: 201 });
  } catch (error) {
    console.error('Error adding category to event:', error);
    return NextResponse.json(
      { error: 'Failed to add category to event' },
      { status: 500 }
    );
  }
}

// GET /api/events/[id]/categories - Get all categories for an event
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

    const { id: eventId } = await params;

    // Check if event exists and user has permission
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        created_by: true,
        event_staff: {
          select: {
            user_id: true,
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

    // Get user role
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    // Check if user has permission to view categories
    // Admins can view categories for all events
    // Event creators can view categories for their events
    // Staff members can view categories for events they are assigned to
    const isCreator = event.created_by === session.user.id;
    const isStaffMember = event.event_staff.some(staff => staff.user_id === session.user.id);
    
    if (user?.role !== 'Admin' && !isCreator && !isStaffMember) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Get all categories for this event
    const eventCategories = await prisma.event_to_category.findMany({
      where: { event_id: eventId },
      include: {
        category: {
          include: {
            participants: true,
          },
        },
      },
    });

    // Transform the response
    const transformedCategories = eventCategories.map(eventCategory => ({
      id: eventCategory.category.id,
      name: eventCategory.category.category_name,
      description: eventCategory.category.description,
      targetAudience: eventCategory.category.target_audience,
      participants: eventCategory.category.participants.length,
      image: eventCategory.category.category_image,
      hasSlotLimit: eventCategory.category.has_slot_limit,
      slotLimit: eventCategory.category.slot_limit,
      price: eventCategory.category.price,
      earlyBirdPrice: eventCategory.category.early_bird_price,
    }));

    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error('Error fetching event categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event categories' },
      { status: 500 }
    );
  }
} 