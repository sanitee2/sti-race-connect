import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const verificationSchema = z.object({
  participantId: z.string(),
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is a Marshal
    if (session.user.role !== 'Marshal') {
      return NextResponse.json(
        { error: 'Only marshals can verify payments' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { participantId, action, rejectionReason } = verificationSchema.parse(body);

    // Fetch the participant and verify marshal owns the event
    const participant = await prisma.participants.findFirst({
      where: {
        id: participantId,
        event: {
          created_by: session.user.id, // Ensure marshal owns the event
        },
      },
      include: {
        event: {
          select: {
            id: true,
            event_name: true,
            created_by: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            category_name: true,
          },
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found or you do not have permission to verify this payment' },
        { status: 404 }
      );
    }

    // Check if payment is already processed
    if (participant.payment_status !== 'Pending') {
      return NextResponse.json(
        { error: 'Payment has already been processed' },
        { status: 400 }
      );
    }

    // Update participant based on action
    const updateData: any = {
      verified_at: new Date(),
      verified_by: session.user.id,
    };

    if (action === 'approve') {
      updateData.payment_status = 'Verified';
      updateData.registration_status = 'Approved';
      updateData.rejection_reason = null; // Clear any previous rejection reason
    } else {
      updateData.payment_status = 'Rejected';
      updateData.registration_status = 'Rejected';
      if (rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }
    }

    const updatedParticipant = await prisma.participants.update({
      where: { id: participantId },
      data: updateData,
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

    // Generate QR code when payment is approved
    if (action === 'approve') {
      try {
        console.log(`Starting QR code generation for participant ${participantId}`);
        const { updateParticipantWithQRCode } = await import('@/lib/qr-code-generator');
        const qrResult = await updateParticipantWithQRCode(participantId, {
          format: 'simple',
          saveToFile: true,
        });
        console.log(`QR code generated successfully for participant ${participantId}:`, {
          qrCodeData: qrResult.qrCodeData,
          qrCodeFileURL: qrResult.qrCodeFileURL,
        });
      } catch (qrError) {
        console.error('Error generating QR code for approved participant:', qrError);
        console.error('QR Error details:', {
          message: qrError instanceof Error ? qrError.message : 'Unknown error',
          stack: qrError instanceof Error ? qrError.stack : undefined,
        });
        // Don't fail the approval process if QR generation fails
      }
    }

    const message = action === 'approve' 
      ? `Payment approved for ${participant.user.name}'s registration to ${participant.event.event_name}` 
      : `Payment rejected for ${participant.user.name}'s registration to ${participant.event.event_name}`;

    return NextResponse.json({
      message,
      participant: {
        id: updatedParticipant.id,
        user: updatedParticipant.user,
        event: updatedParticipant.event,
        category: updatedParticipant.category,
        payment_status: updatedParticipant.payment_status,
        registration_status: updatedParticipant.registration_status,
        verified_at: updatedParticipant.verified_at,
        rejection_reason: updatedParticipant.rejection_reason,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error processing payment verification:', error);
    return NextResponse.json(
      { error: 'Failed to process payment verification' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 