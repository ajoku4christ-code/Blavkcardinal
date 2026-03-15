import { NextRequest, NextResponse } from 'next/server';
import { getAllGuests, getGuestCount, getTotalRevenue, getGuestById, updatePaymentStatus, adminLogin } from '@/lib/db';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendTicketEmail(guest: any) {
  const qrData = `${guest.ticket_id}|${guest.email}`;
  const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
    width: 250,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' }
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Exclusive House Party" <noreply@party.com>',
    to: guest.email,
    subject: '🎉 Your Gate Pass - Exclusive House Party',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0D0D0D; color: #FFFFFF; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1A1A2E 0%, #0D0D0D 100%); border-radius: 20px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 32px; font-weight: bold; color: #C9A227; margin: 0; }
          .subtitle { color: #A0A0A0; margin-top: 10px; }
          .ticket { background: #16213E; border-radius: 15px; padding: 30px; text-align: center; border: 2px solid #C9A227; }
          .qr-code { margin: 20px 0; }
          .guest-name { font-size: 24px; font-weight: bold; color: #C9A227; margin: 15px 0; }
          .details { color: #A0A0A0; font-size: 14px; line-height: 2; }
          .ticket-id { font-family: monospace; font-size: 16px; color: #C9A227; margin-top: 15px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .btn { display: inline-block; background: #C9A227; color: #0D0D0D; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">🎉 Exclusive House Party</h1>
            <p class="subtitle">Your Gate Pass - Payment Approved!</p>
          </div>
          <div class="ticket">
            <img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code" />
            <div class="guest-name">${guest.full_name}</div>
            <div class="details">
              <div>📅 March 28, 2026</div>
              <div>⏰ 8:00 PM - Till Dawn</div>
              <div>📍 Abuja, Nigeria</div>
            </div>
            <div class="ticket-id">Ticket ID: ${guest.ticket_id}</div>
          </div>
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?ticketId=${guest.ticket_id}" class="btn">View Ticket</a>
          </div>
          <div class="footer">
            <p>Present this QR code at the entrance.</p>
            <p>© 2026 Exclusive House Party</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Ticket email sent to:', guest.email);
  } catch (error) {
    console.error('Email error:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, username, password, guestId, status } = body;

    if (action === 'login') {
      const admin = adminLogin(username, password);
      if (!admin) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      return NextResponse.json({ success: true, admin });
    }

    if (action === 'approve' || action === 'reject') {
      const newStatus = action === 'approve' ? 'paid' : 'rejected';
      const guest = getGuestById(guestId);
      
      if (!guest) {
        return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
      }

      updatePaymentStatus(guestId, newStatus);

      if (action === 'approve') {
        await sendTicketEmail(guest);
      }

      return NextResponse.json({ 
        success: true, 
        message: `Guest ${action}d successfully`,
        emailSent: action === 'approve'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const guests = getAllGuests(status || undefined);
  const count = getGuestCount();
  const revenue = getTotalRevenue();

  return NextResponse.json({ guests, count, revenue });
}
