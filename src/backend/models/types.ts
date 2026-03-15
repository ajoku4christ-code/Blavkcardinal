export interface Guest {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  payment_method: string;
  payment_status: string;
  stripe_payment_id?: string;
  bank_transfer_proof?: string;
  ticket_id: string;
  qr_code_data?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  name: string;
  date: string;
  time: string;
  location: string;
  gate_fee: number;
  max_guests: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Admin {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface PaymentRecord {
  id: number;
  guest_id: number;
  amount: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  created_at: string;
}

export interface Ticket {
  id: number;
  guest_id: number;
  ticket_id: string;
  event_id: number;
  qr_data: string;
  status: 'valid' | 'used' | 'cancelled';
  checked_in_at?: string;
  created_at: string;
}

export type GuestStatus = 'pending' | 'paid' | 'rejected';
export type PaymentMethod = 'bank_transfer' | 'card';
