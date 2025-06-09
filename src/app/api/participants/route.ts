import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const participants = await prisma.participants.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            event_name: true,
          },
        },
        category: {
          select: {
            category_name: true,
          },
        },
      },
    });

    // Transform the data to match the frontend structure
    const transformedParticipants = participants.map(participant => ({
      id: participant.id,
      user: participant.user,
      event: {
        name: participant.event.event_name,
      },
      category: participant.category,
      rfid_number: participant.rfid_number,
      registration_status: participant.registration_status,
      payment_status: participant.payment_status,
    }));

    return NextResponse.json(transformedParticipants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, event_id, category_id } = body;

    // Validate required fields
    if (!user_id || !event_id || !category_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if the participant already exists in this event and category
    const existingParticipant = await prisma.participants.findFirst({
      where: {
        user_id,
        event_id,
        category_id,
      },
    });

    if (existingParticipant) {
      return NextResponse.json(
        { error: "Participant already registered for this event and category" },
        { status: 400 }
      );
    }

    // Create new participant
    const participant = await prisma.participants.create({
      data: {
        user_id,
        event_id,
        category_id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            event_name: true,
          },
        },
        category: {
          select: {
            category_name: true,
          },
        },
      },
    });

    // Transform the response to match the frontend structure
    const transformedParticipant = {
      id: participant.id,
      user: participant.user,
      event: {
        name: participant.event.event_name,
      },
      category: participant.category,
      rfid_number: participant.rfid_number,
      registration_status: participant.registration_status,
      payment_status: participant.payment_status,
    };

    return NextResponse.json(transformedParticipant);
  } catch (error) {
    console.error("Error creating participant:", error);
    return NextResponse.json(
      { error: "Failed to create participant" },
      { status: 500 }
    );
  }
} 