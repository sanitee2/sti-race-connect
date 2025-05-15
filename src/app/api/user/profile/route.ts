import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Get the session to check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user data from Prisma/MongoDB
    const user = await prisma.users.findUnique({
      where: { email: session.user.email as string },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile_picture: true,
        marshal_profile: {
          select: {
            organization_name: true,
            role_position: true
          }
        },
        runner_profile: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch additional stats data
    // Get upcoming events count for this marshal
    const upcomingEventsCount = await prisma.event_staff.count({
      where: {
        user_id: user.id,
        event: {
          event_date: {
            gte: new Date()
          }
        }
      }
    });

    // Get participants count from events this marshal is assigned to
    const participantsCount = await prisma.participants.count({
      where: {
        category: {
          events: {
            some: {
              event: {
                event_staff: {
                  some: {
                    user_id: user.id
                  }
                }
              }
            }
          }
        }
      }
    });

    // Get total events staffed by this marshal
    const totalEventsStaffed = await prisma.event_staff.count({
      where: {
        user_id: user.id
      }
    });

    // Format the response
    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profile_picture,
      stats: {
        upcomingEvents: upcomingEventsCount,
        totalParticipants: participantsCount,
        eventsStaffed: totalEventsStaffed
      }
    };

    return NextResponse.json(formattedUser);
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 