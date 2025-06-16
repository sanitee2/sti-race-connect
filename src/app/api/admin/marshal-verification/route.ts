import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const verificationSchema = z.object({
  userId: z.string(),
  action: z.enum(['approve', 'reject']),
});

export async function POST(req: Request) {
  try {
    // For now, we'll check for admin role later - focusing on functionality first
    // TODO: Add proper authentication check for admin role
    
    const body = await req.json();
    const { userId, action } = verificationSchema.parse(body);
    
    // Check if user exists and is a marshal
    const user = await prisma.users.findFirst({
      where: {
        id: userId,
        role: 'Marshal',
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Marshal not found' },
        { status: 404 }
      );
    }

    // Check if user is already processed
    if (user.verification_status !== 'Pending') {
      return NextResponse.json(
        { message: 'Marshal application has already been processed' },
        { status: 400 }
      );
    }

    // Update verification status
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        verification_status: action === 'approve' ? 'Approved' : 'Rejected',
        verified_at: new Date(),
        // TODO: Add verified_by field when authentication is implemented
        // verified_by: adminId,
      },
    });

    const message = action === 'approve' 
      ? 'Marshal application approved successfully' 
      : 'Marshal application rejected successfully';

    return NextResponse.json({
      message,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        verification_status: updatedUser.verification_status,
        verified_at: updatedUser.verified_at,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error processing marshal verification:', error);
    return NextResponse.json(
      { message: 'Error processing marshal verification' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 