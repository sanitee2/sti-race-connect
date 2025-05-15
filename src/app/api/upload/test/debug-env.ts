/**
 * Simple utility to help debug environment variables
 * Access at /api/upload/test/debug-env
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    keys: {
      DO_SPACES_KEY: process.env.DO_SPACES_KEY ? 
        `${process.env.DO_SPACES_KEY.substring(0, 5)}...${process.env.DO_SPACES_KEY.substring(process.env.DO_SPACES_KEY.length - 4)}` : 
        "not set",
      DO_SPACES_SECRET: process.env.DO_SPACES_SECRET ? 
        "provided (hidden for security)" : 
        "not set"
    },
    recommendations: {
      DO_SPACES_KEY: process.env.DO_SPACES_KEY ? "✓ Set" : "⚠️ Missing - Set DO_SPACES_KEY in .env.local",
      DO_SPACES_SECRET: process.env.DO_SPACES_SECRET ? "✓ Set" : "⚠️ Missing - Set DO_SPACES_SECRET in .env.local"
    }
  });
} 