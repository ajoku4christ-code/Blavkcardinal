import { NextRequest, NextResponse } from 'next/server';
import { createGuest, getGuestByEmail, getGuestByTicketId, getAllGuests, getGuestCount, getTotalRevenue } from '@/lib/db';
import { addEventJob } from '@/backend/queues/queue';
import { EVENT_TYPES } from '@/backend/services/eventTypes';

const GATE_FEE = 10000;
const MAX_GUESTS = 100;

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

    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = fullName.trim();
    const sanitizedPhone = phone.trim();

    const existingGuest = getGuestByEmail(sanitizedEmail);
    if (existingGuest) {
      return NextResponse.json(
        { error: 'This email is already registered. Please check your dashboard.' },
        { status: 400 }
      );
    }

    const guest = createGuest({ 
      fullName: sanitizedName, 
      email: sanitizedEmail, 
      phone: sanitizedPhone, 
      paymentMethod: paymentMethod || 'bank_transfer' 
    });

    const guestId = Number(guest.id);
    const ticketId = String(guest.ticketId);

    addEventJob(EVENT_TYPES.USER_REGISTERED, {
      guestId,
      ticketId,
      email: sanitizedEmail,
      fullName: sanitizedName,
      phone: sanitizedPhone,
      amount: GATE_FEE,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      guestId,
      ticketId,
      message: 'Registration successful! Proceed to payment.',
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
