import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Configuration
const bucketName = "sti-race-connect";
const region = "sgp1";
const accessKeyId = "DO801ZFJNYXTJFNZWLM7"; // Hardcoded access key

// Clean up the secret key by trimming whitespace
let secretAccessKey = "";
if (process.env.DO_SPACES_SECRET) {
  secretAccessKey = process.env.DO_SPACES_SECRET.trim();
} else if (process.env.NEXT_PUBLIC_DO_SPACES_SECRET) {
  secretAccessKey = process.env.NEXT_PUBLIC_DO_SPACES_SECRET.trim();
}

// Digital Ocean Spaces client configuration
const s3Client = new S3Client({
  region: "us-east-1", // Always use us-east-1 for Digital Ocean Spaces
  endpoint: `https://${region}.digitaloceanspaces.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: false,
});

export async function POST(request: NextRequest) {
  try {
    // Verify secret key is available
    if (!secretAccessKey) {
      return NextResponse.json({
        error: "Missing Digital Ocean Spaces Secret Key",
        instructions: "Please set your DO_SPACES_SECRET in .env.local file and restart the server"
      }, { status: 400 });
    }

    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Extract the key (file path) from the URL
    // URL format: https://sti-race-connect.sgp1.digitaloceanspaces.com/profile-picture/filename.jpg
    const urlObj = new URL(url);
    const key = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
    
    if (!key) {
      return NextResponse.json(
        { error: "Invalid image URL" },
        { status: 400 }
      );
    }

    console.log("Deleting from Digital Ocean Spaces:");
    console.log("Bucket:", bucketName);
    console.log("Key:", key);
    
    // Delete from Digital Ocean Spaces
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    try {
      await s3Client.send(command);
      console.log("Delete successful");
      
      return NextResponse.json({ 
        status: "success",
        message: "Image deleted successfully" 
      });
    } catch (deleteError: any) {
      console.error("Error deleting file:", deleteError);
      
      return NextResponse.json({
        error: "Failed to delete file",
        message: deleteError.message,
        code: deleteError.Code || deleteError.code,
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("General error during deletion:", error);
    
    return NextResponse.json({
      error: "Failed to process deletion",
      message: error.message,
    }, { status: 500 });
  }
} 