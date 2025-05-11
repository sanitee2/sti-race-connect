import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No active session' }, { status: 200 });
    }

    // For Next.js App Router, we don't need to manually clear cookies
    // The front-end will handle sign-out through next-auth's signOut function
    
    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'An error occurred during logout' }, { status: 500 });
  }
} 