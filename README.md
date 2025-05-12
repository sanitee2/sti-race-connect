# STI Race Connect

A comprehensive race event management platform for STI running events.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Dark mode support across all components
- Responsive design for mobile and desktop
- Race event management system
- User authentication
- Runner and marshal profiles
- Event registration and management

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# MongoDB Connection String
MONGODB_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mydatabase?retryWrites=true&w=majority"

# Next Auth
NEXTAUTH_SECRET="a-long-random-secret-key-for-nextauth"
NEXTAUTH_URL="http://localhost:3000"
```

## Deploy on Vercel

### Prerequisites

1. A MongoDB database (like MongoDB Atlas)
2. A Vercel account

### Deployment Steps

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. In Vercel, create a new project and import your repository

3. **Environment Variables Setup**:

   - Add all environment variables from your `.env` file to Vercel project settings
   - For production deployment, set `NEXTAUTH_URL` to your production URL

4. **Database Setup**:

   - Make sure your MongoDB connection string is correctly set in Vercel environment variables
   - Ensure your IP address or network access is properly configured in MongoDB Atlas

5. **Prisma Configuration**:

   - The project is already configured to generate Prisma client during build
   - `vercel-build` command includes necessary Prisma steps
   - No additional Prisma setup is required as both dependencies and scripts are configured in `package.json`

6. Deploy the project

### Verifying Prisma Setup

The following scripts in `package.json` ensure proper Prisma setup during deployment:

```json
"build": "prisma generate && next build",
"postinstall": "prisma generate",
"vercel-build": "prisma generate && prisma db push && next build"
```

These commands ensure that:

1. Prisma client is generated during the build process
2. Prisma client is regenerated after dependencies are installed
3. The database schema is synced during Vercel deployment

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Prisma Documentation](https://www.prisma.io/docs) - learn about Prisma ORM.
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - cloud database service.
