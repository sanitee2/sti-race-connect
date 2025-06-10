import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma, Role, Gender, TshirtSize } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build where clause
    let where: Prisma.usersWhereInput = {};

    // Add search condition if search query exists
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add role condition if role is not 'all'
    if (role !== 'all') {
      where.role = role as Role;
    }

    // Get total count for pagination
    const total = await prisma.users.count({ where });

    // Get users with pagination
    const users = await prisma.users.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        created_at: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile_picture: true,
        created_at: true,
        updated_at: true,
      }
    });

    // Calculate total pages
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      users,
      pagination: {
        total,
        pages,
        page,
        limit,
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Extract basic user data
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as Role;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const gender = formData.get('gender') as Gender;
    const address = formData.get('address') as string;
    
    // Get profile picture if it exists
    const profilePicture = formData.get('profilePicture') as File | null;
    let profile_picture = '';
    
    if (profilePicture) {
      // Handle profile picture upload here
      // For now, we'll just store a placeholder URL
      profile_picture = '/placeholder-profile.jpg';
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare profile data based on role
    const profile = {
      dateOfBirth,
      gender,
      address,
      // Runner specific fields
      tshirtSize: formData.get('tshirtSize') as TshirtSize,
      emergencyContactName: formData.get('emergencyContactName') as string,
      emergencyContactPhone: formData.get('emergencyContactPhone') as string,
      emergencyContactRelationship: formData.get('emergencyContactRelationship') as string,
      // Marshal specific fields
      organizationName: formData.get('organizationName') as string,
      rolePosition: formData.get('rolePosition') as string,
      socialMediaLinks: formData.get('socialMediaLinks') as string,
      responsibilities: formData.get('responsibilities') as string,
    };

    // Create the user with the appropriate profile
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        profile_picture,
        ...(role === 'Runner' ? {
          runner_profile: {
            create: {
              date_of_birth: new Date(dateOfBirth),
              gender,
              address,
              tshirt_size: profile.tshirtSize,
              emergency_contact_name: profile.emergencyContactName,
              emergency_contact_phone: profile.emergencyContactPhone,
              emergency_contact_relationship: profile.emergencyContactRelationship,
            }
          }
        } : role === 'Marshal' ? {
          marshal_profile: {
            create: {
              date_of_birth: new Date(dateOfBirth),
              gender,
              address: address || null,
              organization_name: profile.organizationName || "Not specified",
              role_position: profile.rolePosition || "Member",
              social_media_links: profile.socialMediaLinks || null,
              responsibilities: profile.responsibilities,
            }
          }
        } : {}),
      },
    });

    return NextResponse.json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Error creating user', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// ... existing PATCH and DELETE methods ... 