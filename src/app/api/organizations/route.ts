import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Schema for organization creation validation
const createOrgSchema = z.object({
  name: z.string().min(3, { message: "Organization name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  logo_url: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  phone_number: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal('')),
  social_media: z.record(z.string().optional()).optional(),
});

// GET handler to retrieve all organizations
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const organizations = await prisma.organizations.findMany({
      include: {
        members: {
          select: {
            id: true,
            user_id: true,
            membership_role: true,
            joined_at: true,
            user: {
              select: {
                name: true,
                email: true,
                profile_picture: true
              }
            }
          }
        }
      }
    });
    
    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

// POST handler to create a new organization
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const body = await req.json();
    
    // Validate body against schema
    const validationResult = createOrgSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    
    // Create the organization
    const organization = await prisma.organizations.create({
      data: {
        name: data.name,
        description: data.description,
        logo_url: data.logo_url,
        address: data.address,
        website: data.website || null,
        phone_number: data.phone_number || null,
        email: data.email || null,
        social_media: data.social_media || {},
        is_verified: false,
        created_by: session.user.id,
      }
    });
    
    // Associate the creator as an owner
    await prisma.user_organization.create({
      data: {
        user_id: session.user.id,
        organization_id: organization.id,
        membership_role: 'Owner', // Creator is assigned as owner
        joined_at: new Date(),
      }
    });
    
    // Create a default member role for this organization
    const defaultRole = await prisma.organization_roles.create({
      data: {
        organization_id: organization.id,
        title: 'Member',
        description: 'Regular organization member',
        is_leadership: false,
        is_default: true,
        permissions: {},
      }
    });
    
    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
} 