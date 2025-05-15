# Digital Ocean Spaces Integration

This application uses Digital Ocean Spaces for image storage. Follow these steps to configure your environment for image uploads.

## Required Digital Ocean Configuration

1. Ensure your Digital Ocean Spaces bucket is properly configured:

   - **Bucket name:** sti-race-connect
   - **Region:** sgp1 (Singapore)
   - **CORS Configuration:** Make sure CORS is enabled for your web application domain

2. Check that your API keys have the correct permissions:
   - The access key should have read and write permissions

## Environment Variables Setup

1. Create a `.env.local` file in the root of your project if it doesn't exist

2. Add the following environment variables to your `.env.local` file:

```
# Digital Ocean Spaces Configuration
DO_SPACES_KEY=DO801ZFJNYXTJFNZWLM7
DO_SPACES_SECRET=your_secret_key_here
```

> **Note:** Replace `your_secret_key_here` with the actual secret key provided.

3. Restart your development server for the changes to take effect.

## CORS Configuration for Your Bucket

To enable uploads from your web application, you need to configure CORS for your Digital Ocean Spaces bucket:

1. Log in to your Digital Ocean account
2. Navigate to the Spaces section
3. Select your bucket (sti-race-connect)
4. Click on "Settings" and then "CORS"
5. Add a new CORS configuration:

```json
{
  "AllowedOrigins": ["*"], // In production, restrict this to your domain
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3000
}
```

## Usage

The application includes an `ImageUpload` component that can be used in two modes:

1. **Profile Picture Upload:** For single image uploads like user avatars
2. **Gallery Upload:** For multiple image uploads

Each uploaded file is stored in Digital Ocean Spaces and accessible via a public URL.

Example implementation:

```tsx
// Profile picture upload
<ImageUpload
  variant="profile"
  onChange={(url) => setProfileImage(url as string)}
  folder="profiles"
/>

// Gallery upload
<ImageUpload
  variant="gallery"
  onChange={(urls) => setGalleryImages(urls as string[])}
  maxImages={4}
  folder="gallery"
/>
```

## Testing

The application includes a test page at `/image-upload-test` that demonstrates both profile and gallery image uploads. You can access this page using the floating image button in the bottom right corner of the application.
