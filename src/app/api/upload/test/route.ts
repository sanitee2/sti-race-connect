import { NextResponse } from "next/server";
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";

// Configuration
const region = "sgp1";
const bucketName = "sti-race-connect";
const accessKeyId = "DO801ZFJNYXTJFNZWLM7"; // Hardcoded access key since we know it's correct

// Clean up the secret key by trimming whitespace
let secretAccessKey = "";
if (process.env.DO_SPACES_SECRET) {
  secretAccessKey = process.env.DO_SPACES_SECRET.trim();
} else if (process.env.NEXT_PUBLIC_DO_SPACES_SECRET) {
  secretAccessKey = process.env.NEXT_PUBLIC_DO_SPACES_SECRET.trim();
}

console.log("Using credentials:");
console.log("- Access Key ID:", accessKeyId ? `${accessKeyId.substring(0, 5)}...` : "not provided");
console.log("- Secret Key:", secretAccessKey ? "provided (length: " + secretAccessKey.length + ")" : "not provided");

// Create S3 client with proper configuration
const s3Client = new S3Client({
  region: "us-east-1", // Always us-east-1 for Digital Ocean Spaces
  endpoint: `https://${region}.digitaloceanspaces.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: false, // This is important for Digital Ocean Spaces
});

export async function GET() {
  try {
    console.log("Testing Digital Ocean Spaces connection...");
    
    if (!secretAccessKey) {
      return NextResponse.json({
        status: "error",
        message: "Missing Digital Ocean Spaces Secret Key",
        instructions: "Please set your DO_SPACES_SECRET in .env.local file and restart the server",
        credentials: {
          keyProvided: !!accessKeyId,
          secretProvided: false
        }
      }, { status: 400 });
    }

    try {
      // Check if the bucket exists and we have access to it
      const command = new HeadBucketCommand({ Bucket: bucketName });
      await s3Client.send(command);
      console.log("Connection successful! Bucket exists:", bucketName);
      
      return NextResponse.json({
        status: "success",
        message: "Digital Ocean Spaces connection successful",
        buckets: [bucketName],
        credentials: {
          keyProvided: !!accessKeyId,
          secretProvided: !!secretAccessKey
        }
      });
    } catch (error: any) {
      console.error("Error connecting to Digital Ocean Spaces:", error);
      
      if (error.name === 'SignatureDoesNotMatchError' || error.Code === 'SignatureDoesNotMatch') {
        return NextResponse.json({
          status: "error",
          message: "Secret key signature does not match",
          instructions: "Your secret key is incorrect. Please check that you're using the correct secret key from Digital Ocean Spaces.",
          error: error.message,
          code: error.name || error.Code,
          credentials: {
            keyProvided: !!accessKeyId,
            secretProvided: !!secretAccessKey
          }
        }, { status: 403 });
      }
      
      if (error.name === 'NoSuchBucketError' || error.Code === 'NoSuchBucket') {
        return NextResponse.json({
          status: "error",
          message: `Bucket "${bucketName}" does not exist`,
          instructions: "Create this bucket in your Digital Ocean Spaces console or update the bucketName in the code.",
          error: error.message,
          code: error.name || error.Code,
          credentials: {
            keyProvided: !!accessKeyId,
            secretProvided: !!secretAccessKey
          }
        }, { status: 404 });
      }
      
      if (error.name === 'AccessDeniedError' || error.Code === 'AccessDenied') {
        return NextResponse.json({
          status: "error", 
          message: "Access denied to bucket",
          instructions: "Your credentials don't have permission to access this bucket. Check your Space permissions in Digital Ocean.",
          error: error.message,
          code: error.name || error.Code,
          credentials: {
            keyProvided: !!accessKeyId,
            secretProvided: !!secretAccessKey
          }
        }, { status: 403 });
      }
      
      return NextResponse.json({
        status: "error",
        message: "Failed to connect to Digital Ocean Spaces",
        error: error.message,
        code: error.Code || error.code || error.name,
        hint: "Make sure your secret key is correct and matches the one generated with your access key in Digital Ocean",
        credentials: {
          keyProvided: !!accessKeyId,
          secretProvided: !!secretAccessKey
        }
      }, { status: 500 });
    }
  } catch (generalError: any) {
    console.error("General error:", generalError);
    return NextResponse.json({
      status: "error",
      message: "An unexpected error occurred",
      error: generalError.message,
    }, { status: 500 });
  }
} 