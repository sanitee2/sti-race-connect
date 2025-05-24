import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PUT /api/events/[id]/categories/[categoryId] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: eventId, categoryId } = await params;
    const body = await request.json();
    const { name, description, targetAudience } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if event exists and user has permission
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      select: {
        created_by: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.created_by !== session.user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Check if category exists and is linked to this event
    const eventCategory = await prisma.event_to_category.findFirst({
      where: {
        event_id: eventId,
        category_id: categoryId,
      },
      include: {
        category: true,
      },
    });

    if (!eventCategory) {
      return NextResponse.json(
        { error: 'Category not found for this event' },
        { status: 404 }
      );
    }

    // Update the category
    const updatedCategory = await prisma.event_categories.update({
      where: { id: categoryId },
      data: {
        category_name: name,
        description: description || '',
        target_audience: targetAudience || '',
      },
      include: {
        participants: true,
      },
    });

    // Transform the response
    const transformedCategory = {
      id: updatedCategory.id,
      name: updatedCategory.category_name,
      description: updatedCategory.description,
      targetAudience: updatedCategory.target_audience,
      participants: updatedCategory.participants.length,
    };

    return NextResponse.json(transformedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/categories/[categoryId] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: eventId, categoryId } = await params;

    // Check if event exists and user has permission
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      select: {
        created_by: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.created_by !== session.user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Check if category exists and is linked to this event
    const eventCategory = await prisma.event_to_category.findFirst({
      where: {
        event_id: eventId,
        category_id: categoryId,
      },
    });

    if (!eventCategory) {
      return NextResponse.json(
        { error: 'Category not found for this event' },
        { status: 404 }
      );
    }

    // Check if category has participants
    const participantCount = await prisma.participants.count({
      where: { category_id: categoryId },
    });

    if (participantCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with registered participants' },
        { status: 400 }
      );
    }

    // Delete the event-category link first
    await prisma.event_to_category.delete({
      where: { id: eventCategory.id },
    });

    // Check if this category is used in other events
    const otherEventLinks = await prisma.event_to_category.count({
      where: { category_id: categoryId },
    });

    // If this category is not linked to any other events, delete it completely
    if (otherEventLinks === 0) {
      await prisma.event_categories.delete({
        where: { id: categoryId },
      });
    }

    return NextResponse.json(
      { message: 'Category removed from event successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
} 