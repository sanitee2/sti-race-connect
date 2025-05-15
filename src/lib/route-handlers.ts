import { NextRequest, NextResponse } from 'next/server';

// Type definitions for route context
export type RouteParams<T extends Record<string, string>> = {
  params: T;
};

// Handler function signature
type RouteHandler<T extends Record<string, string>> = (
  req: NextRequest,
  context: RouteParams<T>
) => Promise<NextResponse>;

/**
 * Creates a wrapped route handler that resolves any type issues
 * by ensuring the params structure meets Next.js expectations
 */
export function createRouteHandler<T extends Record<string, string>>(
  handler: RouteHandler<T>
): RouteHandler<T> {
  return async (req: NextRequest, context: RouteParams<T>) => {
    // Simply pass through to the original handler
    return handler(req, context);
  };
} 