// Email Service for Password Reset
require('dotenv').config();
const nodemailer = require('nodemailer');

// Check if email is configured
const isEmailConfigured = () => {
    return !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
};

// Email configuration
const emailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
};

// Create transporter only if email is configured
let transporter = null;

if (isEmailConfigured()) {
    transporter = nodemailer.createTransport(emailConfig);
    console.log('✅ Email service initialized');
} else {
    console.warn('⚠️  Email service not configured. Set EMAIL_USER and EMAIL_PASSWORD environment variables.');
    console.warn('   Password reset emails will not be sent until email is configured.');
}

// Verify email configuration
async function verifyEmailConfig() {
    if (!isEmailConfigured()) {
        console.error('❌ Email service is not configured');
        console.error('   Please set the following environment variables:');
        console.error('   - EMAIL_HOST (e.g., smtp.gmail.com)');
        console.error('   - EMAIL_PORT (e.g., 587)');
        console.error('   - EMAIL_USER (your email address)');
        console.error('   - EMAIL_PASSWORD (your email password or app password)');
        return false;
    }

    if (!transporter) {
        console.error('❌ Email transporter not initialized');
        return false;
    }

    try {
        await transporter.verify();
        console.log('✅ Email service is ready to send messages');
        return true;
    } catch (error) {
        console.error('❌ Email service configuration error:', error.message);
        console.error('   Please check your email credentials in environment variables');
        return false;
    }
}

// Send password reset email
async function sendPasswordResetEmail(userEmail, resetToken, userName) {
    // Check if email is configured
    if (!isEmailConfigured()) {
        throw new Error('Email service is not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables in your Vercel dashboard.');
    }

    if (!transporter) {
        throw new Error('Email transporter is not initialized. Please check email configuration.');
    }

    try {
        // Determine the base URL based on environment
        const baseURL = process.env.BASE_URL || 
                       (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
        
        const resetLink = `${baseURL}/reset-password.html?token=${resetToken}`;
        
        const mailOptions = {
            from: {
                name: 'Literary Escape',
                address: process.env.EMAIL_USER
            },
            to: userEmail,
            subject: 'Password Reset Request - Literary Escape',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Reset</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f4f4f4;
                        }
                        .container {
                            background-color: white;
                            border-radius: 10px;
                            padding: 40px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            padding-bottom: 20px;
                            border-bottom: 3px solid #16423c;
                        }
                        .logo {
                            font-size: 28px;
                            font-weight: bold;
                            color: #16423c;
                            margin-bottom: 10px;
                        }
                        h1 {
                            color: #16423c;
                            font-size: 24px;
                            margin-bottom: 20px;
                        }
                        .content {
                            margin-bottom: 30px;
                        }
                        .reset-button {
                            display: inline-block;
                            background-color: #16423c;
                            color: white !important;
                            text-decoration: none;
                            padding: 15px 40px;
                            border-radius: 5px;
                            font-weight: bold;
                            text-align: center;
                            margin: 20px 0;
                        }
                        .reset-button:hover {
                            background-color: #0f2e29;
                        }
                        .button-container {
                            text-align: center;
                            margin: 30px 0;
                        }
                        .alternative-link {
                            background-color: #f8f9fa;
                            border: 1px solid #dee2e6;
                            border-radius: 5px;
                            padding: 15px;
                            margin: 20px 0;
                            word-break: break-all;
                            font-size: 12px;
                            color: #666;
                        }
                        .warning {
                            background-color: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #dee2e6;
                            color: #6c757d;
                            font-size: 14px;
                        }
                        .expiry-info {
                            background-color: #e7f3ff;
                            border-left: 4px solid #0066cc;
                            padding: 12px;
                            margin: 15px 0;
                            border-radius: 4px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">📚 LITERARY ESCAPE</div>
                        </div>
                        
                        <h1>Password Reset Request</h1>
                        
                        <div class="content">
                            <p>Hello ${userName || 'there'},</p>
                            
                            <p>We received a request to reset your password for your Literary Escape account. If you made this request, click the button below to reset your password:</p>
                            
                            <div class="button-container">
                                <a href="${resetLink}" class="reset-button">Reset Your Password</a>
                            </div>
                            
                            <div class="expiry-info">
                                <strong>⏰ Important:</strong> This password reset link will expire in <strong>1 hour</strong> for security reasons.
                            </div>
                            
                            <p>If the button doesn't work, copy and paste this link into your browser:</p>
                            <div class="alternative-link">
                                ${resetLink}
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Security Notice:</strong><br>
                                If you didn't request a password reset, please ignore this email or contact our support team if you're concerned about your account security. Your password will not be changed unless you click the link above and complete the reset process.
                            </div>
                            
                            <p>For security reasons, this link will expire in 1 hour. If you need to reset your password after this link expires, you can request a new reset link.</p>
                        </div>
                        
                        <div class="footer">
                            <p><strong>Literary Escape</strong></p>
                            <p>123 Book Street, Reading City, RC 12345</p>
                            <p>Email: support@literaryescape.com | Phone: +1 (555) 123-4567</p>
                            <p style="margin-top: 15px; font-size: 12px; color: #999;">
                                This is an automated email. Please do not reply to this message.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Password Reset Request - Literary Escape
                
                Hello ${userName || 'there'},
                
                We received a request to reset your password for your Literary Escape account.
                
                To reset your password, click the link below or copy and paste it into your browser:
                ${resetLink}
                
                This link will expire in 1 hour for security reasons.
                
                If you didn't request a password reset, please ignore this email or contact our support team.
                
                Best regards,
                The Literary Escape Team
                
                ---
                Literary Escape
                123 Book Street, Reading City, RC 12345
                Email: support@literaryescape.com
                Phone: +1 (555) 123-4567
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending password reset email:', error);
        throw error;
    }
}

module.exports = {
    sendPasswordResetEmail,
    verifyEmailConfig
};
