import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(request: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { name, phone, address, profileImage } = body;

    // Update user profile
    const updatedUser = await prisma.users.update({
      where: {
        email: session.user.email,
      },
      data: {
        name,
        phone_number: phone,
        address,
        profile_picture: profileImage,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        address: true,
        profile_picture: true,
        role: true,
      },
    });

    // Transform the response to match our frontend model
    const transformedUser = {
      ...updatedUser,
      phone: updatedUser.phone_number,
      profileImage: updatedUser.profile_picture,
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
} 