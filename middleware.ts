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

    // Handle root route redirects based on user role
    if (pathname === '/') {
      switch (userRole) {
        case 'Marshal':
          return NextResponse.redirect(new URL('/dashboard', req.url));
        case 'Admin':
          return NextResponse.redirect(new URL('/admin', req.url));
        case 'Runner':
          return NextResponse.redirect(new URL('/runner-dashboard', req.url));
        default:
          // For any other role or undefined role, redirect to a default page
          return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Define role-based route access rules
    const roleRoutes = {
      Admin: ['/admin'],
      Marshal: [
        '/dashboard', 
        '/marshal-events', 
        '/profile', 
        '/settings',
        '/organizations',
        '/participants',
        '/qr-scanner'
      ],
      Runner: ['/runner', '/runner-dashboard'],
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
    '/',
    '/admin',
    '/admin/:path*',
    '/dashboard/:path*',
    '/marshal-events/:path*',
    '/organizations/:path*',
    '/participants/:path*',
    '/qr-scanner/:path*',
    '/profile',
    '/settings',
    '/runner/:path*',
    '/runner-dashboard/:path*'
  ]
}; 