import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getGuestById, updatePaymentStatus, getGuestCount, getGuestByTicketId } from '@/lib/db';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-02-25.clover' as any,
});

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
    const body = await request.json();
    const { guestId, ticketId, action } = body;

    if (action === 'confirm') {
      const guest = getGuestById(guestId);
      if (!guest) {
        return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
      }

      updatePaymentStatus(guestId, 'paid');
      
      const updatedGuest = getGuestById(guestId);
      if (updatedGuest) {
        await sendTicketEmail(updatedGuest);
      }

      return NextResponse.json({ success: true, message: 'Payment confirmed successfully' });
    }

    if (action === 'webhook') {
      const sig = request.headers.get('stripe-signature');
      const payload = await request.text();
      
      let event;
      try {
        event = stripe.webhooks.constructEvent(
          payload,
          sig || '',
          process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
        );
      } catch (err) {
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const ticketId = session.metadata?.ticketId;
        
        if (ticketId) {
          const guest = getGuestByTicketId(ticketId) as any;
          if (guest) {
            updatePaymentStatus(guest.id, 'paid', session.payment_intent as string);
            await sendTicketEmail(guest);
          }
        }
      }

      return NextResponse.json({ received: true });
    }

    const currentCount = getGuestCount();
    if (currentCount >= MAX_GUESTS) {
      return NextResponse.json(
        { error: 'Event is sold out' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ngn',
            product_data: {
              name: 'Exclusive House Party Gate Pass',
              description: 'Entry to the most exclusive house party in Abuja',
            },
            unit_amount: GATE_FEE * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?ticketId=${ticketId}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?ticketId=${ticketId}&cancelled=true`,
      metadata: {
        ticketId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Payment failed' },
      { status: 500 }
    );
  }
}
