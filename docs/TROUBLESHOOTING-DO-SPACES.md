# Troubleshooting Digital Ocean Spaces Integration

This guide will help you troubleshoot common issues with Digital Ocean Spaces integration.

## API Keys - Required Configuration

1. **Get Digital Ocean Spaces API Keys**:

   - Log in to Digital Ocean (https://cloud.digitalocean.com/)
   - Click on your profile icon in the top-right corner
   - Select "API" from the dropdown menu
   - Scroll down to "Spaces access keys" section
   - Click "Generate New Key"
   - Enter a name (e.g., "STI Race Connect")
   - **Important**: Copy both the Access Key and Secret Key immediately (Secret Key is only shown once)

2. **Configure Environment Variables**:
   - Create a `.env.local` file in the root of your project
   - Add the following lines:
     ```
     DO_SPACES_KEY=your_access_key_id
     DO_SPACES_SECRET=your_secret_key
     ```
   - Restart your development server

## Testing the Connection

We've created several test endpoints to help diagnose issues:

1. **Check Environment Variables**:

   - Visit `/api/upload/test/debug-env` in your browser
   - This will show if your environment variables are being read correctly

2. **Test API Connection**:

   - Visit `/api/upload/test` in your browser
   - This tests if your API keys can connect to Digital Ocean Spaces

3. **Test Bucket Access**:

   - Visit `/api/upload/bucket-test` in your browser
   - This tests if your bucket exists and if you have permission to upload files

4. **Visual Test Page**:
   - Visit `/image-upload-test` in your browser
   - This provides a visual interface to test uploads

## Common Issues and Solutions

### 1. "InvalidArgument: UnknownError" when uploading

This usually indicates one of these issues:

- **Wrong region**: Make sure you're using the correct region (`sgp1` for Singapore)
- **Bucket name mismatch**: Verify the bucket name is exactly `sti-race-connect`
- **Permission issues**: Check that your API key has write permissions

### 2. "NoSuchBucket" errors

This means either:

- The bucket doesn't exist in your Digital Ocean account
- The bucket name is misspelled
- Your API key doesn't have permission to access this bucket

**Solution**: Log in to Digital Ocean, go to Spaces, and verify the bucket exists.

### 3. Environment Variables Not Working

If the test endpoints show your environment variables aren't being read:

1. Check the `.env.local` file exists in the project root (not in any subdirectory)
2. Verify the variable names are exactly `DO_SPACES_KEY` and `DO_SPACES_SECRET`
3. Make sure you've restarted your development server after creating/editing the file

## Manual Verification

To manually check your bucket configuration:

1. Log in to Digital Ocean
2. Go to Spaces
3. Select your `sti-race-connect` bucket
4. Check the following:
   - **Region**: Should match what we're using (sgp1)
   - **Permissions**: Go to Settings > Permissions to check access
   - **CORS**: Go to Settings > CORS to ensure proper configuration

## CORS Configuration

If you're having issues with web uploads, configure CORS:

1. Go to Digital Ocean > Spaces > sti-race-connect > Settings > CORS
2. Add this configuration:
   ```json
   {
     "AllowedOrigins": ["*"],
     "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
     "AllowedHeaders": ["*"],
     "MaxAgeSeconds": 3000
   }
   ```

## Image Upload Implementation Notes

- The application uses the AWS SDK v3 (`@aws-sdk/client-s3`) to interact with Digital Ocean Spaces
- We use Server API routes to handle uploads securely
- Make sure all environment variables are properly set up
- When testing, visit the `/image-upload-test` page which automatically checks the connection
