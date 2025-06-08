import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createRouteHandler } from '@/lib/route-handlers';
import { PageParams } from '@/types/pageParams';

// Define API route params
type ApiRouteParams = PageParams<'id'>;

// GET handler to retrieve a specific organization by ID
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const params = await context.params;
    const organizationId = params.id;
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch organization from Prisma
    const organization = await prisma.organizations.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          select: {
            id: true,
            user_id: true,
            membership_role: true,
            joined_at: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile_picture: true
              }
            },
            role_assignments: {
              include: {
                role: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_picture: true
          }
        },
        roles: true
      }
    });
    
    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }
    
    // Get events related to this organization (to be implemented)
    // This would require a relationship between events and organizations
    // For now, return empty array
    const events: Array<{id: string; name: string; date: string; participants: number}> = [];
    
    // Format the response
    const formattedOrganization = {
      ...organization,
      events
    };
    
    return NextResponse.json(formattedOrganization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

// PATCH handler to update a specific organization
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const params = await context.params;
    const organizationId = params.id;
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the user has permission to edit this organization
    const userOrg = await prisma.user_organization.findFirst({
      where: {
        organization_id: organizationId,
        user_id: session.user.id,
        membership_role: {
          in: ['Owner', 'Admin']
        }
      }
    });
    
    // Check if user is a site admin
    const user = await prisma.users.findUnique({
      where: { id: session.user.id }
    });
    
    const isAdmin = user?.role === 'Admin';
    
    if (!userOrg && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this organization' },
        { status: 403 }
      );
    }
    
    // Get request body
    const body = await req.json();
    
    // Update the organization
    const updatedOrg = await prisma.organizations.update({
      where: { id: organizationId },
      data: {
        name: body.name,
        description: body.description,
        logo_url: body.logo_url,
        address: body.address,
        website: body.website,
        phone_number: body.phone_number,
        email: body.email,
        social_media: body.social_media,
        is_verified: isAdmin ? body.is_verified : undefined, // Only admins can change verification
      }
    });
    
    return NextResponse.json(updatedOrg);
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a specific organization
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const params = await context.params;
    const organizationId = params.id;
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the user has permission to delete this organization
    const userOrg = await prisma.user_organization.findFirst({
      where: {
        organization_id: organizationId,
        user_id: session.user.id,
        membership_role: 'Owner'
      }
    });
    
    // Check if user is a site admin
    const user = await prisma.users.findUnique({
      where: { id: session.user.id }
    });
    
    const isAdmin = user?.role === 'Admin';
    
    if (!userOrg && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this organization' },
        { status: 403 }
      );
    }
    
    // Delete the organization
    await prisma.organizations.delete({
      where: { id: organizationId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
} 