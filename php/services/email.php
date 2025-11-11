<?php
/**
 * Email Service for Password Reset
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService {
    private $mailer;
    private $isConfigured;

    public function __construct() {
        $this->isConfigured = $this->checkConfiguration();
        
        if ($this->isConfigured) {
            $this->initializeMailer();
        }
    }

    private function checkConfiguration() {
        return !empty(getenv('EMAIL_USER')) && !empty(getenv('EMAIL_PASSWORD'));
    }

    private function initializeMailer() {
        $this->mailer = new PHPMailer(true);
        
        try {
            // Server settings
            $this->mailer->isSMTP();
            $this->mailer->Host = getenv('EMAIL_HOST') ?: 'smtp.gmail.com';
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = getenv('EMAIL_USER');
            $this->mailer->Password = getenv('EMAIL_PASSWORD');
            $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $this->mailer->Port = getenv('EMAIL_PORT') ?: 587;
            
            $this->mailer->setFrom(getenv('EMAIL_USER'), 'Literary Escape');
        } catch (Exception $e) {
            error_log('Email service initialization error: ' . $e->getMessage());
            $this->isConfigured = false;
        }
    }

    public function sendPasswordResetEmail($userEmail, $resetToken, $userName = '') {
        if (!$this->isConfigured) {
            throw new Exception('Email service is not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.');
        }

        try {
            $baseURL = getenv('BASE_URL') ?: 
                      (getenv('VERCEL_URL') ? 'https://' . getenv('VERCEL_URL') : 'http://localhost');
            
            $resetLink = $baseURL . '/reset-password.html?token=' . $resetToken;

            $this->mailer->clearAddresses();
            $this->mailer->addAddress($userEmail);
            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'Password Reset Request - Literary Escape';
            
            $this->mailer->Body = $this->getResetEmailHTML($resetLink, $userName);
            $this->mailer->AltBody = $this->getResetEmailText($resetLink, $userName);

            $this->mailer->send();
            error_log('Password reset email sent to: ' . $userEmail);
            
            return true;
        } catch (Exception $e) {
            error_log('Error sending password reset email: ' . $e->getMessage());
            throw $e;
        }
    }

    private function getResetEmailHTML($resetLink, $userName) {
        $name = $userName ?: 'there';
        
        return <<<HTML
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
            <p>Hello {$name},</p>
            
            <p>We received a request to reset your password for your Literary Escape account. If you made this request, click the button below to reset your password:</p>
            
            <div class="button-container">
                <a href="{$resetLink}" class="reset-button">Reset Your Password</a>
            </div>
            
            <div class="expiry-info">
                <strong>⏰ Important:</strong> This password reset link will expire in <strong>1 hour</strong> for security reasons.
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <div class="alternative-link">
                {$resetLink}
            </div>
            
            <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                If you didn't request a password reset, please ignore this email or contact our support team if you're concerned about your account security.
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Literary Escape</strong></p>
            <p>Email: support@literaryescape.com</p>
            <p style="margin-top: 15px; font-size: 12px; color: #999;">
                This is an automated email. Please do not reply to this message.
            </p>
        </div>
    </div>
</body>
</html>
HTML;
    }

    private function getResetEmailText($resetLink, $userName) {
        $name = $userName ?: 'there';
        
        return <<<TEXT
Password Reset Request - Literary Escape

Hello {$name},

We received a request to reset your password for your Literary Escape account.

To reset your password, click the link below or copy and paste it into your browser:
{$resetLink}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email or contact our support team.

Best regards,
The Literary Escape Team

---
Literary Escape
Email: support@literaryescape.com
TEXT;
    }
}
