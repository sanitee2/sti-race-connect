import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/events/[id]/register - Register for an event with GCash receipt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { error: 'Only runners can register for events' },
        { status: 403 }
      );
    }

    const { id: eventId } = await params;
    const body = await request.json();
    const { categoryId, registrationDetails } = body; // Required: specific category to register for, optional: additional details


    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required for registration' },
        { status: 400 }
      );
    }

    if (!paymentReceiptUrl) {
      return NextResponse.json(
        { error: 'GCash receipt screenshot is required for registration' },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      include: {
        event_categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if event is still upcoming
    if (event.event_date < new Date()) {
      return NextResponse.json(
        { error: 'Cannot register for past events' },
        { status: 400 }
      );
    }

    // Verify that the category exists for this event
    const eventCategory = event.event_categories.find(
      ec => ec.category.id === categoryId
    );

    if (!eventCategory) {
      return NextResponse.json(
        { error: 'Category not available for this event' },
        { status: 400 }
      );
    }

    // Check if user is already registered for ANY category in this event
    const existingEventRegistration = await prisma.participants.findFirst({
      where: {
        user_id: session.user.id,
        event_id: eventId,
      },
      include: {
        category: {
          select: {
            id: true,
            category_name: true,
          },
        },
      },
    });

    if (existingEventRegistration) {
      return NextResponse.json(
        {
          error: `You are already registered for the "${existingEventRegistration.category.category_name}" category in this event. You can only register for one category per event.`
        },
        { status: 400 }
      );
    }

    const existingRegistration = await prisma.participants.findFirst({
      where: {
        user_id: session.user.id,
        event_id: eventId,
      },
      include: {
        category: {
          select: {
            category_name: true,
          },
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { 
          error: `You are already registered for this event in the "${existingRegistration.category.category_name}" category. You can only register for one category per event.` 
        },
        { status: 400 }
      );
    }

    // For paid events, require proof of payment
    if (!event.is_free_event && eventCategory.category.price && eventCategory.category.price > 0) {
      if (!registrationDetails?.proofOfPayment) {
        return NextResponse.json(
          { error: 'Proof of payment is required for paid events' },
          { status: 400 }
        );
      }
    }

    // Validate required emergency contact information
    if (!registrationDetails?.emergencyContactName || !registrationDetails?.emergencyContactPhone) {
      return NextResponse.json(
        { error: 'Emergency contact information is required for registration' },
        { status: 400 }
      );
    }

    // Update user's runner profile with any changes made during registration
    if (registrationDetails) {
      const updateData: any = {};

      if (registrationDetails.emergencyContactName) {
        updateData.emergency_contact_name = registrationDetails.emergencyContactName;
      }
      if (registrationDetails.emergencyContactPhone) {
        updateData.emergency_contact_phone = registrationDetails.emergencyContactPhone;
      }
      if (registrationDetails.emergencyContactRelationship) {
        updateData.emergency_contact_relationship = registrationDetails.emergencyContactRelationship;
      }
      if (registrationDetails.tshirtSize) {
        updateData.tshirt_size = registrationDetails.tshirtSize;
      }
      if (registrationDetails.dateOfBirth) {
        updateData.date_of_birth = new Date(registrationDetails.dateOfBirth);
      }
      if (registrationDetails.gender) {
        updateData.gender = registrationDetails.gender;
      }

      // Update runner profile if there are changes
      if (Object.keys(updateData).length > 0) {
        // Get user's current address from their profile
        const user = await prisma.users.findUnique({
          where: { id: session.user.id },
          select: { address: true }
        });

        await prisma.runner_profile.upsert({
          where: { user_id: session.user.id },
          update: updateData,
          create: {
            user_id: session.user.id,
            // Required fields with defaults if not provided
            emergency_contact_name: registrationDetails.emergencyContactName || '',
            emergency_contact_phone: registrationDetails.emergencyContactPhone || '',
            emergency_contact_relationship: registrationDetails.emergencyContactRelationship || '',
            tshirt_size: registrationDetails.tshirtSize || 'M',
            date_of_birth: registrationDetails.dateOfBirth ? new Date(registrationDetails.dateOfBirth) : new Date(),
            gender: registrationDetails.gender || 'Male',
            address: user?.address || '', // Use user's address or empty string
            ...updateData
          }
        });
      }
    }
    const registration = await prisma.participants.create({
      data: {
        user_id: session.user.id,
        event_id: eventId,
        category_id: categoryId,
        registration_status: 'Pending', // Set to Pending for marshal approval
        payment_status: 'Pending', // Payment can be handled separately
        proof_of_payment: registrationDetails?.proofOfPayment || null, // Store proof of payment if provided

      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            category_name: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Registration submitted successfully! Your registration and payment receipt are now pending marshal verification.',
      registration: {
        id: registration.id,
        eventId: eventId,
        categoryId: registration.category_id,
        categoryName: registration.category.category_name,
        registrationStatus: registration.registration_status,
        paymentStatus: registration.payment_status,
        registrationDate: registration.registered_at,
        hasPaymentReceipt: !!registration.payment_receipt_url,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    );
  }
}

// GET /api/events/[id]/register - Check registration status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: eventId } = await params;

    // Check if user is registered for this specific event
    const registrations = await prisma.participants.findMany({
      where: {
        user_id: session.user.id,
        event_id: eventId,
      },
      include: {
        category: {
          select: {
            id: true,
            category_name: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      isRegistered: registrations.length > 0,
      registrations: registrations.map(reg => ({
        id: reg.id,
        categoryId: reg.category_id,
        categoryName: reg.category.category_name,
        registrationStatus: reg.registration_status,
        paymentStatus: reg.payment_status,
        registrationDate: reg.registered_at,
        hasPaymentReceipt: !!reg.payment_receipt_url,
        verifiedAt: reg.verified_at,
        rejectionReason: reg.rejection_reason,
      })),
    });

  } catch (error) {
    console.error('Error checking registration status:', error);
    return NextResponse.json(
      { error: 'Failed to check registration status' },
      { status: 500 }
    );
  }
} 