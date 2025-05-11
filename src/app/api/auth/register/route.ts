import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// Use bcryptjs for more secure password hashing
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const prisma = new PrismaClient();

// Helper function to hash passwords with bcrypt
const hashPassword = async (password: string): Promise<string> => {
  // Use 10 salt rounds which is the recommended default
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Runner profile schema
const runnerProfileSchema = z.object({
  dateOfBirth: z.date().or(z.string().transform(val => new Date(val))),
  gender: z.enum(['Male', 'Female', 'Other']),
  address: z.string(),
  tshirtSize: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
  emergencyContactName: z.string(),
  emergencyContactPhone: z.string(),
  emergencyContactRelationship: z.string(),
});

// Marshal profile schema
const marshalProfileSchema = z.object({
  dateOfBirth: z.date().or(z.string().transform(val => new Date(val))),
  gender: z.enum(['Male', 'Female', 'Other']),
  address: z.string(),
  organizationName: z.string(),
  rolePosition: z.string(),
  socialMediaLinks: z.string().nullable().optional(),
  responsibilities: z.string(),
});

// Validation schemas based on the Prisma model
const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/, 'Password must contain at least one special character'),
  phoneNumber: z.string().nullable().optional(),
  role: z.enum(['Runner', 'Marshal']),
  profile: z.union([runnerProfileSchema, marshalProfileSchema]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = userSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: validatedData.email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }
    
    // Hash password with bcrypt
    const hashedPassword = await hashPassword(validatedData.password);
    
    // Create the user based on role
    if (validatedData.role === 'Runner') {
      const runnerProfile = validatedData.profile as z.infer<typeof runnerProfileSchema>;
      
      // Create runner
      const user = await prisma.users.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          phone_number: validatedData.phoneNumber,
          role: validatedData.role,
          runner_profile: {
            create: {
              date_of_birth: runnerProfile.dateOfBirth,
              gender: runnerProfile.gender,
              address: runnerProfile.address,
              tshirt_size: runnerProfile.tshirtSize,
              emergency_contact_name: runnerProfile.emergencyContactName,
              emergency_contact_phone: runnerProfile.emergencyContactPhone,
              emergency_contact_relationship: runnerProfile.emergencyContactRelationship,
            }
          }
        }
      });
      
      // Don't return the password
      delete (user as any).password;
      
      return NextResponse.json(
        { message: 'Runner registered successfully', user },
        { status: 201 }
      );
    } else {
      const marshalProfile = validatedData.profile as z.infer<typeof marshalProfileSchema>;
      
      // Create marshal
      const user = await prisma.users.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          phone_number: validatedData.phoneNumber,
          role: validatedData.role,
          marshal_profile: {
            create: {
              date_of_birth: marshalProfile.dateOfBirth,
              gender: marshalProfile.gender,
              address: marshalProfile.address,
              organization_name: marshalProfile.organizationName,
              role_position: marshalProfile.rolePosition,
              social_media_links: marshalProfile.socialMediaLinks,
              responsibilities: marshalProfile.responsibilities,
            }
          }
        }
      });
      
      // Don't return the password
      delete (user as any).password;
      
      return NextResponse.json(
        { message: 'Marshal registered successfully', user },
        { status: 201 }
      );
    }
    
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return NextResponse.json(
        { message: `Validation failed: ${errorMessages}` },
        { status: 400 }
      );
    }
    
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Error creating user' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 