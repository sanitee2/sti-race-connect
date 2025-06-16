import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Validation schema for reset password request
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/, 'Password must contain at least one special character'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = resetPasswordSchema.parse(body);
    
    // Find the reset token
    const resetTokenRecord = await prisma.password_reset_tokens.findUnique({
      where: { token: validatedData.token },
    });
    
    if (!resetTokenRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }
    
    // Check if token has expired
    if (new Date() > resetTokenRecord.expires_at) {
      // Delete the expired token
      await prisma.password_reset_tokens.delete({
        where: { token: validatedData.token },
      });
      
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new password reset.' },
        { status: 400 }
      );
    }
    
    // Find the user
    const user = await prisma.users.findUnique({
      where: { email: resetTokenRecord.email },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);
    
    // Update the user's password
    await prisma.users.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    
    // Delete the used reset token
    await prisma.password_reset_tokens.delete({
      where: { token: validatedData.token },
    });
    
    // Optionally, delete all other reset tokens for this user
    await prisma.password_reset_tokens.deleteMany({
      where: { email: resetTokenRecord.email },
    });
    
    return NextResponse.json({
      message: 'Password updated successfully',
    }, { status: 200 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting your password' },
      { status: 500 }
    );
  }
} 