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
  organizationId: z.string().optional(), // Optional organization ID
});

// Marshal profile schema
const marshalProfileSchema = z.object({
  dateOfBirth: z.date().or(z.string().transform(val => new Date(val))),
  gender: z.enum(['Male', 'Female', 'Other']),
  address: z.string(),
  organizationId: z.string().optional(), // Optional organization ID
  organizationName: z.string(), // Set default value on the client
  rolePosition: z.string().default("Member"), // Default role position
  socialMediaLinks: z.string().nullable().optional(),
  responsibilities: z.string().default("General marshal duties"), // Default responsibilities
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
  profile_picture: z.string().nullable().optional(),
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
          profile_picture: validatedData.profile_picture,
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
      
      // If organization is selected, associate the user with the organization
      if (runnerProfile.organizationId) {
        try {
          // Associate user with organization as a member
          await prisma.user_organization.create({
            data: {
              user_id: user.id,
              organization_id: runnerProfile.organizationId,
              membership_role: 'Member', // Default role is Member
              joined_at: new Date(),
            }
          });
          
          // Find default roles for this organization
          const defaultRoles = await prisma.organization_roles.findMany({
            where: {
              organization_id: runnerProfile.organizationId,
              is_default: true
            }
          });
          
          // Assign default roles if any exist
          if (defaultRoles.length > 0) {
            const userOrg = await prisma.user_organization.findUnique({
              where: {
                user_id_organization_id: {
                  user_id: user.id,
                  organization_id: runnerProfile.organizationId
                }
              }
            });
            
            if (userOrg) {
              // Create role assignments for each default role
              for (const role of defaultRoles) {
                await prisma.role_assignment.create({
                  data: {
                    member_id: userOrg.id,
                    role_id: role.id,
                    assigned_at: new Date(),
                  }
                });
              }
            }
          }
        } catch (orgError) {
          console.error('Error associating user with organization:', orgError);
          // Continue with user creation even if organization association fails
        }
      }
      
      // Don't return the password
      delete (user as any).password;
      
      return NextResponse.json(
        { message: 'Runner registered successfully', user },
        { status: 201 }
      );
    } else {
      const marshalProfile = validatedData.profile as z.infer<typeof marshalProfileSchema>;
      
      // Create marshal with pending verification status
      const user = await prisma.users.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          phone_number: validatedData.phoneNumber,
          profile_picture: validatedData.profile_picture,
          role: validatedData.role,
          verification_status: 'Pending', // Marshals need admin approval
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
      
      // If organization is selected, associate the user with the organization
      if (marshalProfile.organizationId) {
        try {
          // Associate user with organization as a member
          await prisma.user_organization.create({
            data: {
              user_id: user.id,
              organization_id: marshalProfile.organizationId,
              membership_role: 'Member', // Default role is Member
              joined_at: new Date(),
            }
          });
          
          // Find default roles for this organization
          const defaultRoles = await prisma.organization_roles.findMany({
            where: {
              organization_id: marshalProfile.organizationId,
              is_default: true
            }
          });
          
          // Assign default roles if any exist
          if (defaultRoles.length > 0) {
            const userOrg = await prisma.user_organization.findUnique({
              where: {
                user_id_organization_id: {
                  user_id: user.id,
                  organization_id: marshalProfile.organizationId
                }
              }
            });
            
            if (userOrg) {
              // Create role assignments for each default role
              for (const role of defaultRoles) {
                await prisma.role_assignment.create({
                  data: {
                    member_id: userOrg.id,
                    role_id: role.id,
                    assigned_at: new Date(),
                  }
                });
              }
            }
          }
        } catch (orgError) {
          console.error('Error associating user with organization:', orgError);
          // Continue with user creation even if organization association fails
        }
      }
      
      // Don't return the password
      delete (user as any).password;
      
      return NextResponse.json(
        { message: 'Marshal registration submitted successfully. Your account is pending admin approval.', user },
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