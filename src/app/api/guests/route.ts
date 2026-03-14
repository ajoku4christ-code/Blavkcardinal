import { NextRequest, NextResponse } from 'next/server';
import { createGuest, getGuestByEmail, getGuestByTicketId, updatePaymentStatus, getAllGuests, getGuestCount, getTotalRevenue, getGuestById, updateGuestQRCode } from '@/lib/db';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';

const GATE_FEE = 10000;
const MAX_GUESTS = 100;

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
  const qrCodeDataUrl = await QRCode.toDataURL(guest.ticket_id, {
    width: 200,
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
          .title { font-size: 32px; font-weight: bold; color: #E94560; margin: 0; }
          .subtitle { color: #A0A0A0; margin-top: 10px; }
          .ticket { background: #16213E; border-radius: 15px; padding: 30px; text-align: center; border: 2px solid #E94560; }
          .qr-code { margin: 20px 0; }
          .guest-name { font-size: 24px; font-weight: bold; color: #FFD700; margin: 15px 0; }
          .details { color: #A0A0A0; font-size: 14px; line-height: 2; }
          .ticket-id { font-family: monospace; font-size: 16px; color: #E94560; margin-top: 15px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">🎉 Exclusive House Party</h1>
            <p class="subtitle">Your Gate Pass</p>
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
          <div class="footer">
            <p>Present this QR code at the entrance.</p>
            <p>© 2026 Exclusive House Party | Founded by Akinwale Gabriel Atoyebi</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email error:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentCount = getGuestCount();
    if (currentCount >= MAX_GUESTS) {
      return NextResponse.json(
        { error: 'Event is sold out. Maximum 100 guests reached.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { fullName, email, phone, paymentMethod } = body;

    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const existingGuest = getGuestByEmail(email);
    if (existingGuest) {
      return NextResponse.json(
        { error: 'This email is already registered. Please check your dashboard.' },
        { status: 400 }
      );
    }

    const guest = createGuest({ fullName, email, phone, paymentMethod: paymentMethod || 'bank_transfer' });
    
    return NextResponse.json({
      success: true,
      guestId: guest.id,
      ticketId: guest.ticketId,
      message: 'Registration successful!',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticketId = searchParams.get('ticketId');
  const status = searchParams.get('status');

  if (ticketId) {
    const guest = getGuestByTicketId(ticketId);
    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }
    return NextResponse.json(guest);
  }

  const guests = getAllGuests(status || undefined);
  const count = getGuestCount();
  const revenue = getTotalRevenue();

  return NextResponse.json({ guests, count, revenue });
}
