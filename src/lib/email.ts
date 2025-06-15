import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface PasswordResetEmailData {
  email: string;
  name: string;
  resetToken: string;
}

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  };

  return nodemailer.createTransport(config);
};

export const sendPasswordResetEmail = async ({
  email,
  name,
  resetToken,
}: PasswordResetEmailData): Promise<void> => {
  const transporter = createTransporter();
  
  // Verify transporter configuration
  try {
    await transporter.verify();
  } catch (error) {
    console.error('SMTP transporter verification failed:', error);
    throw new Error('Email service configuration error');
  }

  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: {
      name: 'STI Race Connect',
      address: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@stiraceconnect.com',
    },
    to: email,
    subject: 'Reset Your Password - STI Race Connect',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; 
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #ffffff;
          }
          .logo { 
            text-align: center; 
            margin-bottom: 30px; 
          }
          .logo h1 { 
            color: #2563eb; 
            margin: 0; 
            font-size: 28px;
            font-weight: 700;
          }
          .content { 
            background-color: #f8fafc; 
            padding: 30px; 
            border-radius: 8px; 
            border: 1px solid #e2e8f0;
          }
          .button { 
            display: inline-block; 
            background-color: #2563eb; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: 600;
            margin: 20px 0;
          }
          .button:hover { 
            background-color: #1d4ed8; 
          }
          .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #e2e8f0; 
            font-size: 14px; 
            color: #64748b;
            text-align: center;
          }
          .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
          }
          .link-fallback {
            background-color: #f1f5f9;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
            color: #475569;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>STI Race Connect</h1>
          </div>
          
          <div class="content">
            <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
            
            <p>Hello <strong>${name}</strong>,</p>
            
            <p>We received a request to reset the password for your STI Race Connect account associated with <strong>${email}</strong>.</p>
            
            <p>If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset My Password</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This password reset link will expire in 1 hour for security purposes.
            </div>
            
            <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
            
            <div class="link-fallback">
              ${resetUrl}
            </div>
            
            <p><strong>If you didn't request this password reset:</strong></p>
            <ul>
              <li>Please ignore this email - your password will remain unchanged</li>
              <li>Consider changing your password if you suspect unauthorized access</li>
              <li>Contact our support team if you have concerns</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>This email was sent by STI Race Connect</p>
            <p>If you have any questions, please contact our support team.</p>
            <p style="margin-top: 15px; font-size: 12px;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Request - STI Race Connect
      
      Hello ${name},
      
      We received a request to reset the password for your STI Race Connect account associated with ${email}.
      
      If you made this request, please visit the following link to reset your password:
      ${resetUrl}
      
      Important: This password reset link will expire in 1 hour for security purposes.
      
      If you didn't request this password reset, please ignore this email - your password will remain unchanged.
      
      For security, consider changing your password if you suspect unauthorized access.
      
      If you have any questions, please contact our support team.
      
      ---
      STI Race Connect
      This is an automated message, please do not reply to this email.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Test email configuration
export const testEmailConfiguration = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return false;
  }
}; 