# Vercel Deployment Guide for STI Race Connect

This guide provides instructions for deploying the STI Race Connect application to Vercel with Prisma integration.

## Prerequisites

- A [Vercel](https://vercel.com) account
- A MongoDB database (e.g., MongoDB Atlas)
- Git repository with your code

## Environment Variables

Set up the following environment variables in your Vercel project:

| Variable          | Description                                                                      |
| ----------------- | -------------------------------------------------------------------------------- |
| `MONGODB_URI`     | Your MongoDB connection string                                                   |
| `NEXTAUTH_URL`    | Your production URL (e.g., `https://your-app.vercel.app`)                        |
| `NEXTAUTH_SECRET` | A secret string for session encryption (generate with `openssl rand -base64 32`) |
| `NODE_ENV`        | Set to `production` for production deployments                                   |

## Deployment Steps

### Option 1: Automatic Deployments (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure your project settings in Vercel:
   - Framework Preset: Next.js
   - Root Directory: (leave blank if your project is at the root)
3. Add environment variables in the Vercel dashboard
4. Deploy your app

### Option 2: Manual Deployment with Vercel CLI

1. Install Vercel CLI:

   ```bash
   npm i -g vercel
   ```

2. Log in to Vercel:

   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel --prod
   ```

## Working with Prisma in Production

### Database Migrations

When making schema changes, follow these steps:

1. Update your `prisma/schema.prisma` file
2. Run migration on your local development environment:
   ```bash
   npm run db:push
   ```
3. Deploy your application to Vercel

### Vercel Build Process

The application is configured to automatically run Prisma generate during the build process, which ensures the Prisma Client is properly generated before your application code is built.

### Troubleshooting

If you encounter database connection issues:

1. Double check your `MONGODB_URI` in the Vercel environment variables
2. Ensure your database allows connections from Vercel's IP addresses
3. Check if your database requires additional authentication options

### Handling Database Timeouts

MongoDB connections in serverless environments may time out. The Prisma client is configured to handle connection pooling appropriately, but if you encounter connection issues, you may need to adjust your database connection settings.

## Local Development vs Production

- Local development uses the same database configuration but with development features enabled
- Production deployments are optimized for performance and security

## Monitoring

After deployment, monitor your application's performance through:

1. Vercel Analytics dashboard
2. MongoDB Atlas monitoring tools (if using Atlas)

## Useful Commands

- `npm run build`: Build the application with Prisma client generation
- `npm run db:push`: Push schema changes to your database
- `npm run db:studio`: Open Prisma Studio to manage your database

## Need Help?

If you encounter any issues during deployment, refer to:

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
