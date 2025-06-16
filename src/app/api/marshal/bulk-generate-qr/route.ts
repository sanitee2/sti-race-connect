import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { bulkGenerateQRCodes } from '@/lib/qr-code-generator';

export async function POST(request: NextRequest) {
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
        { error: 'Only marshals and admins can generate QR codes' },
        { status: 403 }
      );
    }

    const { eventId, categoryId, participantIds, forceRegenerate = false } = await request.json();

    // Validate input
    if (!eventId && !participantIds) {
      return NextResponse.json(
        { error: 'Either eventId or participantIds must be provided' },
        { status: 400 }
      );
    }

    let targetParticipantIds: string[] = [];

    if (participantIds && Array.isArray(participantIds)) {
      // Use provided participant IDs
      targetParticipantIds = participantIds;
    } else if (eventId) {
      // Get participants from event/category
      const whereClause: any = {
        event_id: eventId,
        registration_status: 'Approved',
      };

      if (categoryId) {
        whereClause.category_id = categoryId;
      }

      // Only include participants without QR codes (unless forcing regeneration)
      if (!forceRegenerate) {
        whereClause.OR = [
          { qr_code_url: null },
          { qr_code_data: null },
        ];
      }

      // Verify user has access to this event
      const event = await prisma.events.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          created_by: true,
          event_staff: {
            select: { user_id: true },
          },
        },
      });

      if (!event) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }

      const isCreator = event.created_by === session.user.id;
      const isStaff = event.event_staff.some(staff => staff.user_id === session.user.id);
      const isAdmin = user.role === 'Admin';

      if (!isCreator && !isStaff && !isAdmin) {
        return NextResponse.json(
          { error: 'Access denied to this event' },
          { status: 403 }
        );
      }

      // Get participant IDs
      const participants = await prisma.participants.findMany({
        where: whereClause,
        select: { id: true },
      });

      targetParticipantIds = participants.map(p => p.id);
    }

    if (targetParticipantIds.length === 0) {
      return NextResponse.json(
        { 
          message: 'No participants found that need QR code generation',
          successful: [],
          failed: [],
          totalProcessed: 0
        }
      );
    }

    // Generate QR codes in bulk
    const result = await bulkGenerateQRCodes(targetParticipantIds, {
      format: 'simple',
      saveToFile: true,
      batchSize: 5, // Process 5 at a time to avoid overwhelming the system
    });

    // Get details of processed participants
    const processedParticipants = await prisma.participants.findMany({
      where: {
        id: { in: [...result.successful, ...result.failed.map(f => f.participantId)] },
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
          },
        },
        event: {
          select: {
            id: true,
            event_name: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: `QR code generation completed. ${result.successful.length} successful, ${result.failed.length} failed.`,
      totalProcessed: targetParticipantIds.length,
      successful: result.successful,
      failed: result.failed,
      participants: processedParticipants.map(p => ({
        id: p.id,
        name: p.user.name,
        email: p.user.email,
        category: p.category.category_name,
        event: p.event.event_name,
        hasQRCode: !!p.qr_code_url,
        qrCodeUrl: p.qr_code_url,
      })),
    });

  } catch (error) {
    console.error('Error in bulk QR code generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR codes' },
      { status: 500 }
    );
  }
}

// GET endpoint to check QR code generation status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const categoryId = searchParams.get('categoryId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Check access to event
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const event = await prisma.events.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        event_name: true,
        created_by: true,
        event_staff: {
          select: { user_id: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const isCreator = event.created_by === session.user.id;
    const isStaff = event.event_staff.some(staff => staff.user_id === session.user.id);
    const isAdmin = user?.role === 'Admin';

    if (!isCreator && !isStaff && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied to this event' },
        { status: 403 }
      );
    }

    // Get QR code generation status
    const whereClause: any = {
      event_id: eventId,
      registration_status: 'Approved',
    };

    if (categoryId) {
      whereClause.category_id = categoryId;
    }

    const [totalParticipants, participantsWithQR, participantsWithoutQR] = await Promise.all([
      prisma.participants.count({
        where: whereClause,
      }),
      prisma.participants.count({
        where: {
          ...whereClause,
          qr_code_url: { not: null },
          qr_code_data: { not: null },
        },
      }),
      prisma.participants.count({
        where: {
          ...whereClause,
          OR: [
            { qr_code_url: null },
            { qr_code_data: null },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      eventId,
      eventName: event.event_name,
      categoryId,
      totalParticipants,
      participantsWithQR,
      participantsWithoutQR,
      completionPercentage: totalParticipants > 0 ? Math.round((participantsWithQR / totalParticipants) * 100) : 0,
    });

  } catch (error) {
    console.error('Error checking QR code generation status:', error);
    return NextResponse.json(
      { error: 'Failed to check QR code status' },
      { status: 500 }
    );
  }
} 