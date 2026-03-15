import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { getGuestById, updateBankTransferProof } from '@/lib/db';

const UPLOAD_DIR = join(process.cwd(), 'public', 'receipts');

if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const receipt = formData.get('receipt') as File | null;
    const guestId = formData.get('guestId');
    const ticketId = formData.get('ticketId');

    if (!receipt) {
      return NextResponse.json(
        { error: 'Receipt file is required' },
        { status: 400 }
      );
    }

    if (!guestId || !ticketId) {
      return NextResponse.json(
        { error: 'Guest ID and Ticket ID are required' },
        { status: 400 }
      );
    }

    const guest = getGuestById(Number(guestId));
    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      );
    }

    const bytes = await receipt.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = receipt.name.split('.').pop() || 'jpg';
    const fileName = `${ticketId}-${Date.now()}.${fileExtension}`;
    const filePath = join(UPLOAD_DIR, fileName);

    writeFileSync(filePath, buffer);

    const receiptPath = `/receipts/${fileName}`;
    updateBankTransferProof(Number(guestId), receiptPath);

    return NextResponse.json({
      success: true,
      message: 'Receipt uploaded successfully',
      receiptPath
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Receipt upload failed' },
      { status: 500 }
    );
  }
}
