import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

// Configuration
const bucketName = "sti-race-connect";
const region = "sgp1";

// Access key is hardcoded since we know it's correct
const accessKeyId = "DO801ZFJNYXTJFNZWLM7";

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

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "uploads";
    
    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    // Create a unique file name to avoid collisions
    const fileName = `${folder}/${uuidv4()}-${file.name.replace(/\s+/g, "-")}`;
    
    // Convert file to array buffer for upload
    const buffer = Buffer.from(await file.arrayBuffer());
    
    console.log("Uploading to Digital Ocean Spaces with the following params:");
    console.log("Bucket:", bucketName);
    console.log("Key:", fileName);
    console.log("ContentType:", file.type || "application/octet-stream");
    
    // Upload to Digital Ocean Spaces
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ACL: "public-read",
      ContentType: file.type || "application/octet-stream"
    });
    
    try {
      const result = await s3Client.send(command);
      console.log("Upload successful:", result);
      
      // Return the public URL of the file
      const fileUrl = `https://${bucketName}.${region}.digitaloceanspaces.com/${fileName}`;
      
      return NextResponse.json({ url: fileUrl });
    } catch (uploadError: any) {
      console.error("Error uploading file:", uploadError);
      
      if (uploadError.Code === 'SignatureDoesNotMatch') {
        return NextResponse.json({
          error: "Secret key signature does not match",
          message: "Your secret key is incorrect. Please check that you're using the correct secret key from Digital Ocean Spaces.",
          code: uploadError.Code,
        }, { status: 403 });
      }
      
      return NextResponse.json({
        error: "Failed to upload file",
        message: uploadError.message,
        code: uploadError.Code || uploadError.code,
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("General error during upload:", error);
    
    return NextResponse.json({
      error: "Failed to process upload",
      message: error.message,
    }, { status: 500 });
  }
} 