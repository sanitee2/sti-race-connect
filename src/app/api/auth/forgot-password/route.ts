import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

// Validation schema for forgot password request
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = forgotPasswordSchema.parse(body);
    
    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        name: true,
      }
    });
    
    // Always return success response to prevent email enumeration attacks
    // But only send email if user exists
    if (user) {
      // Generate a secure random token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
      
      // Save the reset token to the database
      await prisma.password_reset_tokens.create({
        data: {
          email: user.email,
          token: resetToken,
          expires_at: resetTokenExpiry,
        },
      });
      
      // Send password reset email
      try {
        await sendPasswordResetEmail({
          email: user.email,
          name: user.name,
          resetToken,
        });
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Don't expose email sending errors to the client
        // The token is still created, so user can try again
      }
    }
    
    // Always return success response
    return NextResponse.json({
      message: 'If your email is registered with us, you will receive a password reset link shortly.',
    }, { status: 200 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 