import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
        { error: 'Only marshals and admins can record results' },
        { status: 403 }
      );
    }

    const { participantId, categoryId, completionTime } = await request.json();

    if (!participantId || !categoryId || !completionTime) {
      return NextResponse.json(
        { error: 'Missing required fields: participantId, categoryId, completionTime' },
        { status: 400 }
      );
    }

    // Verify participant exists and is registered for the category
    const participant = await prisma.participants.findFirst({
      where: {
        id: participantId,
        category_id: categoryId,
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

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found or not approved for this category' },
        { status: 404 }
      );
    }

    // Check if result already exists for this participant in this category
    const existingResult = await prisma.results.findUnique({
      where: {
        participant_id_category_id: {
          participant_id: participantId,
          category_id: categoryId,
        },
      },
    });

    if (existingResult) {
      return NextResponse.json(
        { error: 'Result already recorded for this participant in this category' },
        { status: 400 }
      );
    }

    // Create the result record
    const result = await prisma.results.create({
      data: {
        participant_id: participantId,
        category_id: categoryId,
        completion_time: completionTime,
        recorded_at: new Date(),
      },
    });

    // Recalculate rankings for all participants in this category
    await recalculateRankings(categoryId);

    // Fetch the updated result with ranking
    const updatedResult = await prisma.results.findUnique({
      where: {
        participant_id_category_id: {
          participant_id: participantId,
          category_id: categoryId,
        },
      },
      include: {
        participant: {
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

    return NextResponse.json({
      success: true,
      result: updatedResult,
      participant: {
        id: participant.id,
        name: participant.user.name,
        email: participant.user.email,
        category: participant.category.category_name,
        event: participant.event.event_name,
      },
    });

  } catch (error) {
    console.error('Error recording scan result:', error);
    return NextResponse.json(
      { error: 'Failed to record result' },
      { status: 500 }
    );
  }
}

// Helper function to recalculate rankings for a category
async function recalculateRankings(categoryId: string) {
  try {
    // Get all results for this category, ordered by completion time
    const results = await prisma.results.findMany({
      where: {
        category_id: categoryId,
      },
      orderBy: {
        completion_time: 'asc', // Assuming completion_time is stored in a sortable format
      },
    });

    // Convert completion times to milliseconds for proper sorting
    const sortedResults = results.map(result => ({
      ...result,
      timeMs: parseTimeToMilliseconds(result.completion_time),
    })).sort((a, b) => a.timeMs - b.timeMs);

    // Update rankings
    const updatePromises = sortedResults.map((result, index) => {
      return prisma.results.update({
        where: {
          participant_id_category_id: {
            participant_id: result.participant_id,
            category_id: result.category_id,
          },
        },
        data: {
          ranking: index + 1, // Rankings start from 1
        },
      });
    });

    await Promise.all(updatePromises);

  } catch (error) {
    console.error('Error recalculating rankings:', error);
    throw error;
  }
}

// Helper function to parse time string to milliseconds for sorting
function parseTimeToMilliseconds(timeString: string): number {
  try {
    // Handle different time formats: "HH:MM:SS.ms", "MM:SS.ms", "SS.ms"
    const parts = timeString.split(':');
    let hours = 0, minutes = 0, seconds = 0;

    if (parts.length === 3) {
      // HH:MM:SS.ms format
      hours = parseInt(parts[0]);
      minutes = parseInt(parts[1]);
      const secondsParts = parts[2].split('.');
      seconds = parseInt(secondsParts[0]);
      const milliseconds = secondsParts[1] ? parseInt(secondsParts[1].padEnd(3, '0').slice(0, 3)) : 0;
      return (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
    } else if (parts.length === 2) {
      // MM:SS.ms format
      minutes = parseInt(parts[0]);
      const secondsParts = parts[1].split('.');
      seconds = parseInt(secondsParts[0]);
      const milliseconds = secondsParts[1] ? parseInt(secondsParts[1].padEnd(3, '0').slice(0, 3)) : 0;
      return (minutes * 60 + seconds) * 1000 + milliseconds;
    } else {
      // SS.ms format
      const secondsParts = timeString.split('.');
      seconds = parseInt(secondsParts[0]);
      const milliseconds = secondsParts[1] ? parseInt(secondsParts[1].padEnd(3, '0').slice(0, 3)) : 0;
      return seconds * 1000 + milliseconds;
    }
  } catch (error) {
    console.error('Error parsing time string:', timeString, error);
    return 0;
  }
}

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
    const categoryId = searchParams.get('categoryId');

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Get current rankings for the category
    const results = await prisma.results.findMany({
      where: {
        category_id: categoryId,
      },
      include: {
        participant: {
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
        category: {
          select: {
            id: true,
            category_name: true,
          },
        },
      },
      orderBy: {
        ranking: 'asc',
      },
    });

    return NextResponse.json({
      categoryId,
      categoryName: results[0]?.category.category_name || '',
      totalResults: results.length,
      results: results.map(result => ({
        id: result.id,
        participantId: result.participant_id,
        participantName: result.participant.user.name,
        completionTime: result.completion_time,
        ranking: result.ranking,
        recordedAt: result.recorded_at,
        notes: result.notes,
      })),
    });

  } catch (error) {
    console.error('Error fetching rankings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rankings' },
      { status: 500 }
    );
  }
} 