import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

// Helper function to parse completion time
function parseCompletionTime(timeString: string): number {
  // Parse "HH:MM:SS.ms" format to total seconds
  const parts = timeString.split(':');
  if (parts.length === 3) {
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  }
  return 0;
}

// Helper function to format time from seconds
function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

// GET /api/runner/dashboard - Fetch runner dashboard data
export async function GET(request: NextRequest) {
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
        { error: 'Only runners can access this dashboard' },
        { status: 403 }
      );
    }

    // Get runner profile
    const runnerProfile = await prisma.runner_profile.findUnique({
      where: { user_id: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            profile_picture: true,
          },
        },
      },
    });

    if (!runnerProfile) {
      return NextResponse.json(
        { error: 'Runner profile not found' },
        { status: 404 }
      );
    }

    // Get all registrations with event and result data
    const registrations = await prisma.participants.findMany({
      where: {
        user_id: session.user.id,
      },
      include: {
        event: {
          include: {
            creator: {
              select: {
                name: true,
              },
            },
          },
        },
        category: {
          select: {
            category_name: true,
            description: true,
          },
        },
        results: true,
      },
      orderBy: {
        event: {
          event_date: 'desc',
        },
      },
    });

    // Process events data
    const eventsData = registrations.map(registration => {
      const event = registration.event;
      const result = registration.results[0]; // Assuming one result per participant per category
      
      return {
        id: event.id,
        name: event.event_name,
        date: event.event_date,
        location: event.location,
        status: getEventStatus(event.event_date),
        category: registration.category.category_name,
        registrationStatus: registration.registration_status,
        paymentStatus: registration.payment_status,
        organizer: event.creator.name,
        result: result ? {
          completionTime: result.completion_time,
          ranking: result.ranking,
          notes: result.notes,
        } : null,
      };
    });

    // Separate events by status
    const upcomingEvents = eventsData.filter(event => 
      event.status === 'upcoming' || event.status === 'scheduled'
    );
    
    const completedEvents = eventsData.filter(event => 
      event.status === 'completed'
    );

    // Calculate statistics
    const totalEvents = eventsData.length;
    const completedEventsCount = completedEvents.length;
    const upcomingEventsCount = upcomingEvents.length;
    
    // Get events with results for performance analysis
    const eventsWithResults = completedEvents.filter(event => event.result);
    
    // Calculate personal bests by category
    const personalBests: Record<string, { time: string, event: string, date: string }> = {};
    eventsWithResults.forEach(event => {
      if (event.result) {
        const timeInSeconds = parseCompletionTime(event.result.completionTime);
        const category = event.category;
        
        if (!personalBests[category] || timeInSeconds < parseCompletionTime(personalBests[category].time)) {
          personalBests[category] = {
            time: event.result.completionTime,
            event: event.name,
            date: event.date.toISOString(),
          };
        }
      }
    });

    // Calculate recent performance trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentEvents = eventsWithResults.filter(event => 
      new Date(event.date) >= sixMonthsAgo
    );

    // Performance trends by month
    const performanceTrends = recentEvents.reduce((acc: any[], event) => {
      const month = new Date(event.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      const existingMonth = acc.find(item => item.month === month);
      if (existingMonth) {
        existingMonth.events.push(event);
      } else {
        acc.push({
          month,
          events: [event],
        });
      }
      
      return acc;
    }, []);

    // Calculate average rankings and completion times
    const performanceStats = performanceTrends.map(monthData => {
      const eventsWithRankings = monthData.events.filter((e: any) => e.result?.ranking);
      const avgRanking = eventsWithRankings.length > 0 
        ? eventsWithRankings.reduce((sum: number, e: any) => sum + e.result.ranking, 0) / eventsWithRankings.length
        : null;
      
      const avgTime = monthData.events.length > 0
        ? monthData.events.reduce((sum: number, e: any) => sum + parseCompletionTime(e.result.completionTime), 0) / monthData.events.length
        : null;

      return {
        month: monthData.month,
        averageRanking: avgRanking ? Math.round(avgRanking) : null,
        averageTime: avgTime ? formatTime(avgTime) : null,
        eventsCount: monthData.events.length,
      };
    });

    // Registration status summary
    const registrationSummary = {
      pending: registrations.filter(r => r.registration_status === 'Pending').length,
      approved: registrations.filter(r => r.registration_status === 'Approved').length,
      rejected: registrations.filter(r => r.registration_status === 'Rejected').length,
    };

    // Payment status summary
    const paymentSummary = {
      pending: registrations.filter(r => r.payment_status === 'Pending').length,
      paid: registrations.filter(r => r.payment_status === 'Paid').length,
      verified: registrations.filter(r => r.payment_status === 'Verified').length,
    };

    return NextResponse.json({
      profile: {
        name: runnerProfile.user.name,
        email: runnerProfile.user.email,
        profilePicture: runnerProfile.user.profile_picture,
        dateOfBirth: runnerProfile.date_of_birth,
        gender: runnerProfile.gender,
        address: runnerProfile.address,
        tshirtSize: runnerProfile.tshirt_size,
        emergencyContact: {
          name: runnerProfile.emergency_contact_name,
          phone: runnerProfile.emergency_contact_phone,
          relationship: runnerProfile.emergency_contact_relationship,
        },
      },
      statistics: {
        totalEvents,
        completedEvents: completedEventsCount,
        upcomingEvents: upcomingEventsCount,
        personalBests,
        registrationSummary,
        paymentSummary,
      },
      events: {
        upcoming: upcomingEvents,
        completed: completedEvents,
        recent: recentEvents.slice(0, 5), // Last 5 completed events
      },
      performance: {
        trends: performanceStats,
        recentResults: eventsWithResults.slice(0, 10), // Last 10 results
      },
    });

  } catch (error) {
    console.error("Error fetching runner dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
} 