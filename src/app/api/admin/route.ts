import { NextRequest, NextResponse } from 'next/server';
import { getAllGuests, getGuestCount, getTotalRevenue, getGuestById, updatePaymentStatus, adminLogin } from '@/lib/db';

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
      updatePaymentStatus(guestId, newStatus);
      return NextResponse.json({ success: true, message: `Guest ${action}d successfully` });
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
