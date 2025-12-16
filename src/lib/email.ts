import nodemailer from 'nodemailer'
import { logger } from './logger'

interface EmailConfig {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

// Create transporter based on environment
function createTransporter() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD

  if (!host || !user || !pass) {
    logger.warn('Email configuration incomplete - emails will be logged only')
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

const transporter = createTransporter()

// Send email function
export async function sendEmail(config: EmailConfig): Promise<boolean> {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@propestate.com'

  if (!transporter) {
    // In development or when email is not configured, log the email
    logger.info('Email would be sent (no transporter configured)', {
      to: config.to,
      subject: config.subject,
    })
    return true
  }

  try {
    await transporter.sendMail({
      from,
      to: Array.isArray(config.to) ? config.to.join(', ') : config.to,
      subject: config.subject,
      html: config.html,
      text: config.text,
    })

    logger.info('Email sent successfully', {
      to: config.to,
      subject: config.subject,
    })

    return true
  } catch (error) {
    logger.error('Failed to send email', error, {
      to: config.to,
      subject: config.subject,
    })
    return false
  }
}

// Email templates
export const emailTemplates = {
  welcome: (name: string): EmailTemplate => ({
    subject: 'Welcome to PropEstate!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to PropEstate!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Hi ${name},</p>
            <p>Thank you for joining PropEstate - your trusted real estate marketplace!</p>
            <p>With your new account, you can:</p>
            <ul>
              <li>Browse thousands of properties</li>
              <li>Save your favorite listings</li>
              <li>Connect directly with agents and builders</li>
              <li>Get personalized property recommendations</li>
            </ul>
            <p>Start exploring properties now!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Browse Properties
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              If you have any questions, feel free to contact our support team.
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} PropEstate. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to PropEstate!

      Hi ${name},

      Thank you for joining PropEstate - your trusted real estate marketplace!

      With your new account, you can:
      - Browse thousands of properties
      - Save your favorite listings
      - Connect directly with agents and builders
      - Get personalized property recommendations

      Visit ${process.env.NEXTAUTH_URL} to start exploring!

      © ${new Date().getFullYear()} PropEstate. All rights reserved.
    `,
  }),

  inquiryReceived: (
    receiverName: string,
    senderName: string,
    senderEmail: string,
    senderPhone: string | null,
    message: string,
    propertyTitle?: string
  ): EmailTemplate => ({
    subject: `New Inquiry${propertyTitle ? ` for ${propertyTitle}` : ''} - PropEstate`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #2563eb; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0;">New Inquiry Received</h2>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Hi ${receiverName},</p>
            <p>You have received a new inquiry${propertyTitle ? ` for <strong>${propertyTitle}</strong>` : ''}.</p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <p><strong>From:</strong> ${senderName}</p>
              <p><strong>Email:</strong> <a href="mailto:${senderEmail}">${senderEmail}</a></p>
              ${senderPhone ? `<p><strong>Phone:</strong> ${senderPhone}</p>` : ''}
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>

            <p>Please respond to this inquiry promptly to ensure a great customer experience.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:${senderEmail}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reply to Inquiry
              </a>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} PropEstate. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
    text: `
      New Inquiry Received

      Hi ${receiverName},

      You have received a new inquiry${propertyTitle ? ` for ${propertyTitle}` : ''}.

      From: ${senderName}
      Email: ${senderEmail}
      ${senderPhone ? `Phone: ${senderPhone}` : ''}

      Message:
      ${message}

      Please respond to this inquiry promptly.

      © ${new Date().getFullYear()} PropEstate. All rights reserved.
    `,
  }),

  contactFormSubmission: (
    name: string,
    email: string,
    phone: string | null,
    subject: string | null,
    message: string
  ): EmailTemplate => ({
    subject: `Contact Form: ${subject || 'New Message'} - PropEstate`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #059669; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0;">Contact Form Submission</h2>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #059669;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
              ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} PropEstate. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
    text: `
      Contact Form Submission

      Name: ${name}
      Email: ${email}
      ${phone ? `Phone: ${phone}` : ''}
      ${subject ? `Subject: ${subject}` : ''}

      Message:
      ${message}

      © ${new Date().getFullYear()} PropEstate. All rights reserved.
    `,
  }),

  passwordReset: (name: string, resetLink: string): EmailTemplate => ({
    subject: 'Reset Your Password - PropEstate',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #dc2626; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0;">Password Reset Request</h2>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} PropEstate. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request

      Hi ${name},

      We received a request to reset your password. Click the link below to create a new password:

      ${resetLink}

      This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.

      © ${new Date().getFullYear()} PropEstate. All rights reserved.
    `,
  }),

  newsletter: (subject: string, content: string): EmailTemplate => ({
    subject: `${subject} - PropEstate Newsletter`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">PropEstate Newsletter</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            ${content}
          </div>
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>You received this email because you subscribed to our newsletter.</p>
            <p>&copy; ${new Date().getFullYear()} PropEstate. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
    text: `
      PropEstate Newsletter

      ${subject}

      ${content.replace(/<[^>]+>/g, '')}

      You received this email because you subscribed to our newsletter.

      © ${new Date().getFullYear()} PropEstate. All rights reserved.
    `,
  }),

  propertyApproved: (userName: string, propertyTitle: string): EmailTemplate => ({
    subject: `Your Property "${propertyTitle}" Has Been Approved! - PropEstate`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #059669; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0;">Property Approved!</h2>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Hi ${userName},</p>
            <p>Great news! Your property listing <strong>"${propertyTitle}"</strong> has been approved and is now live on PropEstate.</p>
            <p>Potential buyers and renters can now view your listing and contact you directly.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Your Listings
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              Tip: Consider upgrading to a Featured or Premium listing to get more visibility!
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} PropEstate. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
    text: `
      Property Approved!

      Hi ${userName},

      Great news! Your property listing "${propertyTitle}" has been approved and is now live on PropEstate.

      Potential buyers and renters can now view your listing and contact you directly.

      View your listings: ${process.env.NEXTAUTH_URL}/dashboard

      Tip: Consider upgrading to a Featured or Premium listing to get more visibility!

      © ${new Date().getFullYear()} PropEstate. All rights reserved.
    `,
  }),
}

// Send specific email types
export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  const template = emailTemplates.welcome(name)
  return sendEmail({ to, ...template })
}

export async function sendInquiryEmail(
  receiverEmail: string,
  receiverName: string,
  senderName: string,
  senderEmail: string,
  senderPhone: string | null,
  message: string,
  propertyTitle?: string
): Promise<boolean> {
  const template = emailTemplates.inquiryReceived(
    receiverName,
    senderName,
    senderEmail,
    senderPhone,
    message,
    propertyTitle
  )
  return sendEmail({ to: receiverEmail, ...template })
}

export async function sendContactFormEmail(
  name: string,
  email: string,
  phone: string | null,
  subject: string | null,
  message: string
): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER
  if (!adminEmail) {
    logger.warn('No admin email configured for contact form submissions')
    return false
  }
  const template = emailTemplates.contactFormSubmission(name, email, phone, subject, message)
  return sendEmail({ to: adminEmail, ...template })
}

export async function sendPropertyApprovedEmail(
  to: string,
  userName: string,
  propertyTitle: string
): Promise<boolean> {
  const template = emailTemplates.propertyApproved(userName, propertyTitle)
  return sendEmail({ to, ...template })
}

export async function sendNewsletterEmail(
  recipients: string[],
  subject: string,
  content: string
): Promise<{ success: number; failed: number }> {
  const template = emailTemplates.newsletter(subject, content)
  let success = 0
  let failed = 0

  // Send in batches to avoid overloading
  const batchSize = 50
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize)
    const results = await Promise.all(
      batch.map((email) => sendEmail({ to: email, ...template }))
    )
    success += results.filter(Boolean).length
    failed += results.filter((r) => !r).length
  }

  return { success, failed }
}
