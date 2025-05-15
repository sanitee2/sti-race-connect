import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    // Get the session to check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is updating their own profile or has admin permissions
    if (session.user.id !== resolvedParams.id && session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own profile' },
        { status: 403 }
      );
    }

    // Parse the request body
    const userData = await req.json();

    // Update the user data
    const user = await prisma.users.update({
      where: { id: resolvedParams.id },
      data: {
        name: userData.name,
        email: userData.email,
        profile_picture: userData.profileImage,
        // Be careful with role updates - may want to restrict this to admins only
        ...(session.user.role === 'Admin' && { role: userData.role }),
        // If it's a Marshal updating their profile
        ...(userData.role === 'Marshal' && {
          marshal_profile: {
            upsert: {
              create: {
                date_of_birth: new Date(userData.dateOfBirth || new Date()),
                gender: userData.gender || 'Other',
                address: userData.address || '',
                organization_name: userData.organizationName || '',
                role_position: userData.rolePosition || '',
                social_media_links: userData.socialMediaLinks,
                responsibilities: userData.responsibilities || '',
              },
              update: {
                date_of_birth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined,
                gender: userData.gender,
                address: userData.address,
                organization_name: userData.organizationName,
                role_position: userData.rolePosition,
                social_media_links: userData.socialMediaLinks,
                responsibilities: userData.responsibilities,
              },
            },
          },
        }),
        // If it's a Runner updating their profile
        ...(userData.role === 'Runner' && {
          runner_profile: {
            upsert: {
              create: {
                date_of_birth: new Date(userData.dateOfBirth || new Date()),
                gender: userData.gender || 'Other',
                address: userData.address || '',
                tshirt_size: userData.tshirtSize || 'M',
                emergency_contact_name: userData.emergencyContactName || '',
                emergency_contact_phone: userData.emergencyContactPhone || '',
                emergency_contact_relationship: userData.emergencyContactRelationship || '',
              },
              update: {
                date_of_birth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined,
                gender: userData.gender,
                address: userData.address,
                tshirt_size: userData.tshirtSize,
                emergency_contact_name: userData.emergencyContactName,
                emergency_contact_phone: userData.emergencyContactPhone,
                emergency_contact_relationship: userData.emergencyContactRelationship,
              },
            },
          },
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile_picture: true,
        marshal_profile: true,
        runner_profile: true,
      },
    });

    // Format the response
    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profile_picture,
      // Combine marshal and runner profiles based on role
      ...(user.role === 'Marshal' && user.marshal_profile && {
        organizationName: user.marshal_profile.organization_name,
        rolePosition: user.marshal_profile.role_position,
        dateOfBirth: user.marshal_profile.date_of_birth,
        gender: user.marshal_profile.gender,
        address: user.marshal_profile.address,
      }),
      ...(user.role === 'Runner' && user.runner_profile && {
        tshirtSize: user.runner_profile.tshirt_size,
        dateOfBirth: user.runner_profile.date_of_birth,
        gender: user.runner_profile.gender,
        address: user.runner_profile.address,
      }),
      // We're not updating stats in this endpoint, but we'll maintain the structure
      stats: userData.stats,
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 