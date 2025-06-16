import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateParticipantWithQRCode } from '@/lib/qr-code-generator';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is a Runner
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== 'Runner') {
      return NextResponse.json(
        { error: 'Only runners can generate their own QR codes' },
        { status: 403 }
      );
    }

    const { participantId } = await request.json();

    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID is required' },
        { status: 400 }
      );
    }

    // Verify participant exists and belongs to the user
    const participant = await prisma.participants.findFirst({
      where: {
        id: participantId,
        user_id: session.user.id,
        registration_status: 'Approved',
        payment_status: 'Verified',
      },
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
        { error: 'Participant not found or not approved for QR code generation' },
        { status: 404 }
      );
    }

    // Check if QR code already exists
    if (participant.qr_code_url && participant.qr_code_data) {
      return NextResponse.json({
        success: true,
        message: 'QR code already exists',
        participant: {
          id: participant.id,
          name: participant.user.name,
          email: participant.user.email,
          event: participant.event.event_name,
          category: participant.category.category_name,
          hasQRCode: true,
          qrCodeUrl: participant.qr_code_url,
          qrCodeData: participant.qr_code_data,
        }
      });
    }

    // Generate QR code
    console.log(`Generating QR code for participant ${participantId}`);
    
    const qrCodeResult = await updateParticipantWithQRCode(participantId, {
      format: 'simple',
      saveToFile: true,
    });

    console.log(`QR code generated successfully for participant ${participantId}:`, {
      qrCodeData: qrCodeResult.qrCodeData,
      qrCodeFileURL: qrCodeResult.qrCodeFileURL,
    });

    return NextResponse.json({
      success: true,
      message: 'QR code generated successfully',
      participant: {
        id: participant.id,
        name: participant.user.name,
        email: participant.user.email,
        event: participant.event.event_name,
        category: participant.category.category_name,
        hasQRCode: true,
        qrCodeUrl: qrCodeResult.qrCodeFileURL || qrCodeResult.qrCodeURL,
        qrCodeData: qrCodeResult.qrCodeData,
      }
    });

  } catch (error) {
    console.error('Error generating QR code for runner:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate QR code',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 