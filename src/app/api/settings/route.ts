import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user settings from database
    const userSettings = await prisma.user_settings.findUnique({
      where: {
        user_id: session.user.id,
      },
    });

    // If no settings exist, return defaults
    if (!userSettings) {
      return NextResponse.json({
        notifications: {
          email: true,
          push: true,
          eventReminders: true,
          updates: false,
        },
        appearance: {
          theme: "system",
          fontSize: "normal",
          reducedMotion: false,
        },
        security: {
          twoFactorEnabled: false,
        }
      });
    }

    return NextResponse.json(userSettings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notifications, appearance, security } = body;

    // Update or create user settings
    const updatedSettings = await prisma.user_settings.upsert({
      where: {
        user_id: session.user.id,
      },
      update: {
        notifications,
        appearance,
        security: {
          ...security,
          // Don't update password through this endpoint
          passwordLastChanged: undefined
        },
      },
      create: {
        user_id: session.user.id,
        notifications,
        appearance,
        security: {
          ...security,
          passwordLastChanged: undefined
        },
      },
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
} 