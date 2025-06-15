# Forgot Password Setup Guide

This guide explains how to set up the forgot password functionality with email sending capability.

## Overview

The forgot password feature includes:
- **Frontend Pages**: Forgot password form and reset password form
- **API Endpoints**: Password reset request and password reset confirmation
- **Email Service**: Automated email sending with professional templates
- **Database**: Secure token storage with expiration

## Files Created/Modified

### Frontend Pages
- `src/app/auth/forgot-password/page.tsx` - Email input form
- `src/app/auth/reset-password/page.tsx` - New password form with token validation
- `src/app/auth/login/page.tsx` - Updated forgot password link

### API Endpoints
- `src/app/api/auth/forgot-password/route.ts` - Generate and send reset tokens
- `src/app/api/auth/reset-password/route.ts` - Validate tokens and update passwords

### Email Service
- `src/lib/email.ts` - Email service with professional templates

### Database Schema
- Added `password_reset_tokens` model to `prisma/schema.prisma`

## Environment Variables Setup

Add these variables to your `.env.local` file:

```bash
# Email Configuration (Gmail SMTP example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
SMTP_FROM="your_email@gmail.com"

# Application URL (for reset links)
NEXTAUTH_URL="http://localhost:3000"
```

## Email Provider Setup Options

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication**: Go to your Google Account settings
2. **Create App Password**: 
   - Go to Security > 2-Step Verification > App passwords
   - Generate a password for "Mail"
   - Use this password as `SMTP_PASS`

### Option 2: SendGrid (Recommended for Production)

```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASS="your_sendgrid_api_key"
SMTP_FROM="noreply@yourdomain.com"
```

### Option 3: AWS SES (Enterprise)

```bash
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your_aws_access_key"
SMTP_PASS="your_aws_secret_key"
SMTP_FROM="noreply@yourdomain.com"
```

## Database Setup

1. **Update Prisma Schema**: The `password_reset_tokens` model has been added
2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```
3. **Deploy Database Changes** (if using Prisma migrations):
   ```bash
   npx prisma db push
   ```

## Testing the Feature

### Test Email Configuration
You can test your email configuration by running:
```javascript
import { testEmailConfiguration } from '@/lib/email';

const isEmailWorking = await testEmailConfiguration();
console.log('Email configuration working:', isEmailWorking);
```

### Test Flow
1. Go to `/auth/login`
2. Click "Forgot password?"
3. Enter your email address
4. Check your email for the reset link
5. Click the reset link
6. Enter your new password
7. Log in with the new password

## Security Features

### Token Security
- **Cryptographically Secure**: Uses `crypto.randomBytes(32)` for token generation
- **Expiration**: Tokens expire after 1 hour
- **Single Use**: Tokens are deleted after successful password reset
- **Email Enumeration Protection**: Always returns success message

### Password Validation
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Rate Limiting (Recommended)
Consider adding rate limiting to prevent abuse:
```typescript
// Example middleware
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many password reset attempts, please try again later.',
});
```

## Email Template Features

- **Responsive Design**: Works on mobile and desktop
- **Professional Styling**: Clean, modern design matching your brand
- **Security Warnings**: Clear instructions about security
- **Fallback Text**: Plain text version included
- **Link Expiration**: Clear 1-hour expiration notice

## Troubleshooting

### Email Not Sending
1. Check SMTP credentials in `.env.local`
2. Verify firewall/network settings
3. Check email provider's SMTP settings
4. Look at server logs for specific error messages

### Reset Link Not Working
1. Verify `NEXTAUTH_URL` is correct
2. Check if token has expired (1 hour limit)
3. Ensure database connection is working

### Database Errors
1. Run `npx prisma generate` to update client
2. Run `npx prisma db push` to apply schema changes
3. Check MongoDB connection string

## Production Considerations

1. **Use Professional Email Service**: Don't use Gmail for production
2. **Set Up SPF/DKIM Records**: For better email deliverability
3. **Monitor Email Sending**: Set up logging and monitoring
4. **Rate Limiting**: Implement to prevent abuse
5. **HTTPS Only**: Ensure all reset links use HTTPS

## Support

If you encounter issues:
1. Check the browser console for frontend errors
2. Check server logs for backend errors
3. Verify all environment variables are set correctly
4. Test email configuration separately

The forgot password functionality is now fully implemented and ready to use! 