import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma, Role } from "@prisma/client";

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