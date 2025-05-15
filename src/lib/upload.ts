import { v4 as uuidv4 } from "uuid";

/**
 * Uploads a file to Digital Ocean Spaces via the API route
 * @param file The file to upload
 * @param folder Optional folder path inside the bucket
 * @returns Promise with the URL of the uploaded file
 */
export async function uploadToSpaces(
  file: File,
  folder: string = "uploads"
): Promise<string> {
  try {
    // Standardize folder names for consistency
    if (folder === "organization-picture") {
      folder = "organization-logo";
    }
    
    // Always use the sti-race-connect bucket
    const bucket = "sti-race-connect";
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    formData.append("bucket", bucket);
    
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload file");
    }
    
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

/**
 * Deletes a file from Digital Ocean Spaces via the API route
 * @param url The full URL of the file to delete
 * @returns Promise indicating success or failure
 */
export async function deleteFromSpaces(url: string): Promise<void> {
  if (!url || url.startsWith("data:")) {
    // Skip if it's a data URL or empty
    return;
  }
  
  try {
    const response = await fetch("/api/upload/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete file");
    }
    
    // Return nothing if successful
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
} 