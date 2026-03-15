import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private fromAddress: string;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    this.fromAddress = process.env.SMTP_FROM || '"Exclusive House Party" <noreply@party.com>';
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      console.log(`Email sent to ${options.to}`);
      return true;
    } catch (error) {
      console.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, name: string, verificationToken: string): Promise<boolean> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${verificationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0D0D0D; color: #FFFFFF; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1A1A2E 0%, #0D0D0D 100%); border-radius: 20px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 32px; font-weight: bold; color: #C9A227; margin: 0; }
          .content { color: #A0A0A0; line-height: 1.6; }
          .btn { display: inline-block; background: #C9A227; color: #0D0D0D; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">🎉 Verify Your Email</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Please verify your email to complete registration.</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="btn">Verify Email</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2026 Exclusive House Party</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - Exclusive House Party',
      html,
    });
  }

  async sendPaymentConfirmationEmail(
    email: string,
    name: string,
    ticketId: string,
    amount: number
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0D0D0D; color: #FFFFFF; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1A1A2E 0%, #0D0D0D 100%); border-radius: 20px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 32px; font-weight: bold; color: #C9A227; margin: 0; }
          .subtitle { color: #A0A0A0; margin-top: 10px; }
          .details { background: #16213E; border-radius: 15px; padding: 20px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
          .detail-row:last-child { border-bottom: none; }
          .label { color: #A0A0A0; }
          .value { color: #FFFFFF; font-weight: 600; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">💳 Payment Received</h1>
            <p class="subtitle">Your payment is being verified</p>
          </div>
          <div class="details">
            <div class="detail-row">
              <span class="label">Name</span>
              <span class="value">${name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Ticket ID</span>
              <span class="value">${ticketId}</span>
            </div>
            <div class="detail-row">
              <span class="label">Amount</span>
              <span class="value">₦${amount.toLocaleString()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status</span>
              <span class="value" style="color: #FFB800;">Pending Verification</span>
            </div>
          </div>
          <div class="content">
            <p>We have received your payment. Our team is currently verifying the transaction.</p>
            <p>You will receive a confirmation email with your QR ticket once verification is complete.</p>
          </div>
          <div class="footer">
            <p>© 2026 Exclusive House Party</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Payment Received - Exclusive House Party',
      html,
    });
  }

  async sendReceiptAcknowledgementEmail(
    email: string,
    name: string,
    ticketId: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0D0D0D; color: #FFFFFF; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1A1A2E 0%, #0D0D0D 100%); border-radius: 20px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 32px; font-weight: bold; color: #C9A227; margin: 0; }
          .subtitle { color: #A0A0A0; margin-top: 10px; }
          .content { color: #A0A0A0; line-height: 1.6; }
          .status { background: #FFB800; color: #0D0D0D; padding: 15px 30px; border-radius: 25px; display: inline-block; font-weight: bold; margin: 20px 0; }
          .details { background: #16213E; border-radius: 15px; padding: 20px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
          .detail-row:last-child { border-bottom: none; }
          .label { color: #A0A0A0; }
          .value { color: #FFFFFF; font-weight: 600; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">📄 Payment Receipt Received</h1>
            <p class="subtitle">Your payment is under verification</p>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Your payment receipt has been received and is under verification.</p>
            <p>Thank you for your payment of <strong>₦10,000</strong>.</p>
            <div style="text-align: center;">
              <div class="status">⏳ Under Verification</div>
            </div>
            <div class="details">
              <div class="detail-row">
                <span class="label">Ticket ID</span>
                <span class="value" style="color: #C9A227;">${ticketId}</span>
              </div>
            </div>
            <p>Your ticket will be generated once payment is verified by our team.</p>
            <p>This typically takes 10-30 minutes.</p>
          </div>
          <div class="footer">
            <p>© 2026 Exclusive House Party</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Payment Receipt Received - Under Verification',
      html,
    });
  }

  async sendTicketEmail(
    email: string,
    name: string,
    ticketId: string,
    eventDate: string,
    eventTime: string,
    location: string
  ): Promise<boolean> {
    const qrData = `${ticketId}|${email}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 250,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' }
    });

    const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?ticketId=${ticketId}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0D0D0D; color: #FFFFFF; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1A1A2E 0%, #0D0D0D 100%); border-radius: 20px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 32px; font-weight: bold; color: #C9A227; margin: 0; }
          .subtitle { color: #A0A0A0; margin-top: 10px; }
          .content { color: #A0A0A0; line-height: 1.6; }
          .success { background: #00D26A; color: #0D0D0D; padding: 15px 30px; border-radius: 25px; display: inline-block; font-weight: bold; margin: 20px 0; }
          .ticket { background: #16213E; border-radius: 15px; padding: 30px; text-align: center; border: 2px solid #C9A227; }
          .qr-code { margin: 20px 0; }
          .guest-name { font-size: 24px; font-weight: bold; color: #C9A227; margin: 15px 0; }
          .details { color: #A0A0A0; font-size: 14px; line-height: 2; }
          .ticket-id { font-family: monospace; font-size: 16px; color: #C9A227; margin-top: 15px; }
          .btn { display: inline-block; background: #C9A227; color: #0D0D0D; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">🎉 Payment Approved!</h1>
            <p class="subtitle">Your ticket has been generated successfully</p>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Thank you for your payment of <strong>₦10,000</strong>.</p>
            <p>Your ticket has been generated successfully.</p>
            <p>Download your event pass below.</p>
            <div style="text-align: center;">
              <div class="success">✓ Approved</div>
            </div>
          </div>
          <div class="ticket">
            <img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code" />
            <div class="guest-name">${name}</div>
            <div class="details">
              <div>📅 ${eventDate}</div>
              <div>⏰ ${eventTime}</div>
              <div>📍 ${location}</div>
            </div>
            <div class="ticket-id">Ticket ID: ${ticketId}</div>
          </div>
          <div style="text-align: center;">
            <a href="${dashboardUrl}" class="btn">View & Download Ticket</a>
          </div>
          <div class="footer">
            <p>Present this QR code at the entrance.</p>
            <p>© 2026 Exclusive House Party</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '🎉 Your House Party ticket is ready!',
      html,
    });
  }

  async sendReminderEmail(
    email: string,
    name: string,
    ticketId: string,
    eventDate: string,
    eventTime: string,
    location: string,
    daysUntil: number
  ): Promise<boolean> {
    const qrData = `${ticketId}|${email}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' }
    });

    const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?ticketId=${ticketId}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0D0D0D; color: #FFFFFF; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1A1A2E 0%, #0D0D0D 100%); border-radius: 20px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 32px; font-weight: bold; color: #C9A227; margin: 0; }
          .subtitle { color: #A0A0A0; margin-top: 10px; }
          .reminder { background: #C9A227; color: #0D0D0D; padding: 15px 30px; border-radius: 25px; display: inline-block; font-weight: bold; margin: 20px 0; }
          .ticket { background: #16213E; border-radius: 15px; padding: 20px; text-align: center; border: 2px solid #C9A227; }
          .qr-code { margin: 15px 0; }
          .guest-name { font-size: 20px; font-weight: bold; color: #C9A227; margin: 10px 0; }
          .ticket-id { font-family: monospace; font-size: 14px; color: #C9A227; }
          .details { color: #A0A0A0; font-size: 14px; margin-top: 10px; }
          .btn { display: inline-block; background: #C9A227; color: #0D0D0D; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">⏰ Don't Forget!</h1>
            <p class="subtitle">The party is almost here!</p>
          </div>
          <div style="text-align: center;">
            <div class="reminder">${daysUntil} DAY${daysUntil > 1 ? 'S' : ''} TO GO!</div>
          </div>
          <div class="ticket">
            <img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code" />
            <div class="guest-name">${name}</div>
            <div class="details">
              <div>📅 ${eventDate}</div>
              <div>⏰ ${eventTime}</div>
              <div>📍 ${location}</div>
            </div>
            <div class="ticket-id">Ticket ID: ${ticketId}</div>
          </div>
          <div style="text-align: center;">
            <a href="${dashboardUrl}" class="btn">View Ticket</a>
          </div>
          <div class="footer">
            <p>See you there! 🎉</p>
            <p>© 2026 Exclusive House Party</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `⏰ Reminder: Exclusive House Party in ${daysUntil} Day${daysUntil > 1 ? 's' : ''}!`,
      html,
    });
  }

  async sendAdminAlertEmail(
    adminEmail: string,
    alertType: string,
    guestName: string,
    ticketId: string,
    amount: number
  ): Promise<boolean> {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/dashboard`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0D0D0D; color: #FFFFFF; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1A1A2E 0%, #0D0D0D 100%); border-radius: 20px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 28px; font-weight: bold; color: #FFB800; margin: 0; }
          .alert { background: #FFB800; color: #0D0D0D; padding: 15px 30px; border-radius: 25px; display: inline-block; font-weight: bold; margin: 20px 0; }
          .details { background: #16213E; border-radius: 15px; padding: 20px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
          .detail-row:last-child { border-bottom: none; }
          .label { color: #A0A0A0; }
          .value { color: #FFFFFF; font-weight: 600; }
          .btn { display: inline-block; background: #C9A227; color: #0D0D0D; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">🔔 Admin Alert</h1>
            <div class="alert">${alertType}</div>
          </div>
          <div class="details">
            <div class="detail-row">
              <span class="label">Guest Name</span>
              <span class="value">${guestName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Ticket ID</span>
              <span class="value">${ticketId}</span>
            </div>
            <div class="detail-row">
              <span class="label">Amount</span>
              <span class="value">₦${amount.toLocaleString()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time</span>
              <span class="value">${new Date().toLocaleString()}</span>
            </div>
          </div>
          <div style="text-align: center;">
            <a href="${dashboardUrl}" class="btn">Go to Dashboard</a>
          </div>
          <div class="footer">
            <p>© 2026 Exclusive House Party - Admin Panel</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: adminEmail,
      subject: `🔔 Admin Alert: ${alertType} - ${guestName}`,
      html,
    });
  }

  async sendPaymentRejectedEmail(
    email: string,
    name: string,
    ticketId: string,
    reason: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0D0D0D; color: #FFFFFF; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1A1A2E 0%, #0D0D0D 100%); border-radius: 20px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 32px; font-weight: bold; color: #FF4444; margin: 0; }
          .subtitle { color: #A0A0A0; margin-top: 10px; }
          .status { background: #FF4444; color: #FFFFFF; padding: 15px 30px; border-radius: 25px; display: inline-block; font-weight: bold; margin: 20px 0; }
          .content { color: #A0A0A0; line-height: 1.6; }
          .reason { background: #16213E; border-radius: 15px; padding: 20px; margin: 20px 0; border-left: 4px solid #FF4444; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">❌ Payment Update</h1>
            <p class="subtitle">Regarding your ticket: ${ticketId}</p>
          </div>
          <div style="text-align: center;">
            <div class="status">Payment Not Approved</div>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Unfortunately, your payment could not be verified. Here are the details:</p>
            <div class="reason">
              <strong>Reason:</strong><br/>
              ${reason}
            </div>
            <p>Please contact our support team or try again with a valid payment.</p>
          </div>
          <div class="footer">
            <p>© 2026 Exclusive House Party</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Payment Update - Exclusive House Party',
      html,
    });
  }

  async sendPaymentReminderEmail(
    email: string,
    name: string,
    ticketId: string,
    eventDate: string,
    eventTime: string,
    location: string,
    amount: number
  ): Promise<boolean> {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/register?ticketId=${ticketId}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0D0D0D; color: #FFFFFF; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1A1A2E 0%, #0D0D0D 100%); border-radius: 20px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 32px; font-weight: bold; color: #FFB800; margin: 0; }
          .subtitle { color: #A0A0A0; margin-top: 10px; }
          .reminder { background: #FFB800; color: #0D0D0D; padding: 15px 30px; border-radius: 25px; display: inline-block; font-weight: bold; margin: 20px 0; }
          .content { color: #A0A0A0; line-height: 1.6; }
          .amount { font-size: 28px; font-weight: bold; color: #C9A227; margin: 15px 0; }
          .details { background: #16213E; border-radius: 15px; padding: 20px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .label { color: #A0A0A0; }
          .value { color: #FFFFFF; font-weight: 600; }
          .btn { display: inline-block; background: #C9A227; color: #0D0D0D; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">⏰ Complete Your Payment!</h1>
            <p class="subtitle">Don't miss out on the party</p>
          </div>
          <div style="text-align: center;">
            <div class="reminder">Complete payment to secure your ticket</div>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>You registered for the Exclusive House Party but haven't completed your payment yet.</p>
            <div class="amount">₦${amount.toLocaleString()}</div>
            <div class="details">
              <div class="detail-row">
                <span class="label">Event</span>
                <span class="value">Exclusive House Party</span>
              </div>
              <div class="detail-row">
                <span class="label">Date</span>
                <span class="value">${eventDate}</span>
              </div>
              <div class="detail-row">
                <span class="label">Time</span>
                <span class="value">${eventTime}</span>
              </div>
              <div class="detail-row">
                <span class="label">Location</span>
                <span class="value">${location}</span>
              </div>
              <div class="detail-row">
                <span class="label">Ticket ID</span>
                <span class="value" style="color: #C9A227;">${ticketId}</span>
              </div>
            </div>
            <div style="text-align: center;">
              <a href="${dashboardUrl}" class="btn">Complete Payment Now</a>
            </div>
            <p style="margin-top: 20px;">Limited spots available - complete your payment to secure your place!</p>
          </div>
          <div class="footer">
            <p>© 2026 Exclusive House Party</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '⏰ Reminder: Complete your payment to secure your ticket!',
      html,
    });
  }
}

export const emailService = new EmailService();
export default emailService;
