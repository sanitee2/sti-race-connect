import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { participantId } = await request.json();

    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID is required' },
        { status: 400 }
      );
    }

    // Verify participant exists and user has access
    const participant = await prisma.participants.findUnique({
      where: { id: participantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            event_name: true,
          },
        },
        category: {
          select: {
            id: true,
            category_name: true,
          },
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    // Check if user has access (own registration or marshal/admin)
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isOwnRegistration = participant.user_id === session.user.id;
    const isAuthorized = user?.role === 'Admin' || user?.role === 'Marshal' || isOwnRegistration;

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Generate QR code with participant ID
    const qrCodeData = participant.id; // Simple participant ID
    
    // Alternative: Structured data
    // const qrCodeData = JSON.stringify({
    //   participantId: participant.id,
    //   userId: participant.user_id,
    //   eventId: participant.event_id,
    //   categoryId: participant.category_id,
    //   timestamp: new Date().toISOString()
    // });

    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(qrCodeData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return NextResponse.json({
      success: true,
      qrCode: {
        dataUrl: qrCodeUrl,
        content: qrCodeData,
        participant: {
          id: participant.id,
          name: participant.user.name,
          email: participant.user.email,
          event: participant.event.event_name,
          category: participant.category.category_name,
          rfidNumber: participant.rfid_number,
        }
      }
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}

// GET route to retrieve existing QR code
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get('participantId');

    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID is required' },
        { status: 400 }
      );
    }

    // Get participant details
    const participant = await prisma.participants.findUnique({
      where: { id: participantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            event_name: true,
          },
        },
        category: {
          select: {
            id: true,
            category_name: true,
          },
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isOwnRegistration = participant.user_id === session.user.id;
    const isAuthorized = user?.role === 'Admin' || user?.role === 'Marshal' || isOwnRegistration;

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Generate QR code
    const qrCodeData = participant.id;
    const qrCodeUrl = await QRCode.toDataURL(qrCodeData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return NextResponse.json({
      success: true,
      qrCode: {
        dataUrl: qrCodeUrl,
        content: qrCodeData,
        participant: {
          id: participant.id,
          name: participant.user.name,
          email: participant.user.email,
          event: participant.event.event_name,
          category: participant.category.category_name,
          rfidNumber: participant.rfid_number,
          registrationStatus: participant.registration_status,
          paymentStatus: participant.payment_status,
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving QR code:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve QR code' },
      { status: 500 }
    );
  }
} 