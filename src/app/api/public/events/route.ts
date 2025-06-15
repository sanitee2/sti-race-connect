import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

// Helper function to extract event type from categories
function getEventType(categories: any[]): string {
  if (categories.length === 0) return 'Fun Run';
  
  // Check for common patterns in category names
  const categoryNames = categories.map(cat => cat.name.toLowerCase());
  
  if (categoryNames.some(name => name.includes('marathon') || name.includes('21k') || name.includes('42k'))) {
    return 'Marathon';
  } else if (categoryNames.some(name => name.includes('trail'))) {
    return 'Trail Run';
  } else {
    return 'Fun Run';
  }
}

// GET /api/public/events - Fetch all public events (no authentication required)
export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // upcoming, completed, all
    const limit = searchParams.get('limit');

    // Build where clause based on status filter
    let whereClause: any = {};
    
    if (status === 'upcoming') {
      whereClause.event_date = {
        gte: new Date()
      };
    } else if (status === 'completed') {
      whereClause.event_date = {
        lt: new Date()
      };
    }

    // Fetch events with their categories and related data
    const events = await prisma.events.findMany({
      where: whereClause,
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
      orderBy: {
        event_date: status === 'completed' ? 'desc' : 'asc', // Show recent completed events first, upcoming events by date
      },
      take: limit ? parseInt(limit) : undefined,
    });

    // Transform the data to match the expected format for the public events page
    const transformedEvents = events.map(event => {
      const categories = event.event_categories.map(eventCategory => ({
        id: eventCategory.category.id,
        name: eventCategory.category.category_name,
        description: eventCategory.category.description,
        targetAudience: eventCategory.category.target_audience,
        participants: eventCategory.category.participants.length,
      }));

      return {
        id: event.id,
        event_name: event.event_name,
        description: event.description,
        date: formatEventDate(event.event_date),
        location: event.location,
        image_url: event.cover_image || "/assets/login_page.jpg", // Default image
        categories: categories.map(cat => cat.name), // Array of category names for display
        type: getEventType(categories),
        organizer: event.creator.name,
        price: "₱1,200", // TODO: Add price field to database
        status: getEventStatus(event.event_date),
        target_audience: event.target_audience,
        participants: event.event_categories.reduce(
          (total, eventCategory) => total + eventCategory.category.participants.length,
          0
        ),
        // Additional fields for detailed view
        event_date: event.event_date.toISOString(),
        cover_image: event.cover_image,
        gallery_images: event.gallery_images,
      };
    });

    return NextResponse.json(transformedEvents);
  } catch (error) {
    console.error("Error fetching public events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
} 