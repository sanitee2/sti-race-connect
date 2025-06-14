import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // If user is not authenticated, let Next-Auth handle it
    if (!token) {
      return NextResponse.next();
    }

    const userRole = token.role as string;

    // Define role-based route access rules
    const roleRoutes = {
      Admin: ['/admin'],
      Marshal: ['/dashboard', '/marshal-events', '/profile', '/settings'],
      Runner: ['/runner'],
    };

    // Check if the current path matches any role-specific routes
    for (const [role, routes] of Object.entries(roleRoutes)) {
      const matchesRoute = routes.some(route => pathname.startsWith(route));
      
      if (matchesRoute && userRole !== role) {
        // Redirect to unauthorized page if user doesn't have the right role
        return NextResponse.redirect(new URL('/auth/unauthorized', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Always return true here since we handle authorization in the middleware function above
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/dashboard/:path*',
    '/marshal-events/:path*',
    '/profile',
    '/settings',
    '/runner/:path*'
  ]
}; 