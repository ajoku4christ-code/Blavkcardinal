import { NextRequest, NextResponse } from 'next/server';
import { createGuest, getGuestByEmail, getGuestByTicketId, getGuestCount } from '@/lib/db';
import { addEmailJob, addPaymentJob } from '../queues/queue';
import { generateTicketId, validateEmail, validatePhone, sanitizeInput } from '../utils/helpers';

const GATE_FEE = 10000;
const MAX_GUESTS = 100;

interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
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

    const body: RegisterRequest = await request.json();
    const { fullName, email, phone } = body;

    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const sanitizedName = sanitizeInput(fullName);
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedPhone = sanitizeInput(phone);

    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    if (!validatePhone(sanitizedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

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
      paymentMethod: 'bank_transfer',
    });

    const guestId = Number(guest.id);
    const ticketId = String(guest.ticketId);

    addEmailJob('registration', {
      guestId,
      ticketId,
      email: sanitizedEmail,
      fullName: sanitizedName,
      phone: sanitizedPhone,
      template: 'verification',
      subject: 'Complete Your Registration',
      amount: GATE_FEE,
    }).catch(console.error);

    addPaymentJob('registered', {
      guestId,
      ticketId,
      email: sanitizedEmail,
      fullName: sanitizedName,
      phone: sanitizedPhone,
      amount: GATE_FEE,
      paymentMethod: 'bank_transfer',
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
      { error: 'Failed to register. Please try again.' },
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

  return NextResponse.json({ message: 'Use POST to register a new guest' });
}
