import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = loginSchema.parse(body);
    
    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email: validatedData.email },
      include: {
        runner_profile: true,
        marshal_profile: true
      }
    });
    
    // If user doesn't exist or password doesn't match
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Verify password
    const passwordMatches = await bcrypt.compare(validatedData.password, user.password);
    
    if (!passwordMatches) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Don't send password in response
    const { password, ...userWithoutPassword } = user;
    
    // Return user info with role
    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword
    }, { status: 200 });
    
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return NextResponse.json(
        { message: `Validation failed: ${errorMessages}` },
        { status: 400 }
      );
    }
    
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 