'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PAYMENT_TIMEOUT = 10 * 60;

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(PAYMENT_TIMEOUT);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [guestData, setGuestData] = useState<{ guestId: number; ticketId: string } | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verifying' | 'approved' | 'rejected' | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (step === 3 && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, timeLeft]);

  useEffect(() => {
    if (step === 3 && guestData) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/guests?ticketId=${guestData.ticketId}`);
          const data = await res.json();
          if (data.payment_status === 'paid') {
            setVerificationStatus('approved');
            setSuccess('Payment approved! Your ticket is ready.');
            clearInterval(interval);
          } else if (data.payment_status === 'rejected') {
            setVerificationStatus('rejected');
            setError('Payment rejected. Please contact support.');
            clearInterval(interval);
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [step, guestData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      setGuestData({ guestId: data.guestId, ticketId: data.ticketId });
      setStep(2);
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    setStep(3);
    setTimeLeft(PAYMENT_TIMEOUT);
  };

  const handleReceiptUpload = async () => {
    if (!receiptFile) {
      setError('Please select a receipt image to upload');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('receipt', receiptFile);
      uploadFormData.append('guestId', guestData?.guestId?.toString() || '');
      uploadFormData.append('ticketId', guestData?.ticketId || '');

      const response = await fetch('/api/upload-receipt', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Receipt upload failed. Please try again.');
        return;
      }

      setSuccess('Receipt uploaded successfully! Payment is under verification.');
      setVerificationStatus('verifying');
    } catch (err) {
      setError('Receipt upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
          ← Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Get Your <span className="text-[#C9A227]">Gate Pass</span>
          </h1>
          <p className="text-white/60">Secure your spot at the most exclusive party in Abuja</p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= s
                      ? 'bg-[#C9A227] text-white'
                      : 'bg-white/10 text-white/40'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-0.5 mx-2 ${step > s ? 'bg-[#C9A227]' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8">
          {step === 1 && (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Email Address</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="+234..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏦</span>
                    <div>
                      <div className="font-semibold text-[#C9A227]">Bank Transfer Only</div>
                      <div className="text-sm text-white/60">Make payment via bank transfer</div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </button>
              </div>
            </form>
          )}

          {step === 2 && guestData && (
            <div className="text-center">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                Registration Successful!
              </h2>
              <p className="text-white/60 mb-6">
                Your Ticket ID: <span className="font-mono text-[#C9A227]">{guestData.ticketId}</span>
              </p>

              <div className="bg-[#16213E] rounded-xl p-6 mb-6 text-left">
                <h3 className="font-semibold mb-4">Payment Summary</h3>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60">Gate Pass</span>
                  <span>₦10,000</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold text-[#C9A227]">₦10,000</span>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                className="btn-primary w-full"
              >
                Continue to Bank Details
              </button>

              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm mt-4">
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="text-6xl mb-6">🏦</div>
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Bank Transfer Details
              </h2>
              <p className="text-white/60 mb-4">
                Transfer ₦10,000 to the account below
              </p>

              {timeLeft > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                  <div className="text-sm text-yellow-400 mb-1">Payment expires in</div>
                  <div className="text-3xl font-bold font-mono text-yellow-400">
                    {formatTime(timeLeft)}
                  </div>
                </div>
              )}

              {timeLeft === 0 && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <div className="text-red-400 font-semibold">Payment window expired</div>
                  <p className="text-white/60 text-sm mt-1">Please contact support or try again</p>
                </div>
              )}

              <div className="bg-[#16213E] rounded-xl p-6 mb-6">
                <div className="text-left space-y-4">
                  <div>
                    <div className="text-sm text-white/40">Bank Name</div>
                    <div className="text-lg font-semibold">Access Bank</div>
                  </div>
                  <div>
                    <div className="text-sm text-white/40">Account Number</div>
                    <div className="text-lg font-semibold font-mono">0123456789</div>
                  </div>
                  <div>
                    <div className="text-sm text-white/40">Account Name</div>
                    <div className="text-lg font-semibold">House Party Events</div>
                  </div>
                  <div>
                    <div className="text-sm text-white/40">Amount</div>
                    <div className="text-lg font-semibold text-[#C9A227]">₦10,000</div>
                  </div>
                  <div>
                    <div className="text-sm text-white/40">Reference Code</div>
                    <div className="text-lg font-semibold font-mono text-[#C9A227]">{guestData?.ticketId}</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-white/60 mb-2">Upload Payment Receipt</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#C9A227] file:text-white file:cursor-pointer"
                />
                {receiptFile && (
                  <p className="text-sm text-green-400 mt-2">Selected: {receiptFile.name}</p>
                )}
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm mb-4">
                  {success}
                </div>
              )}

              {verificationStatus === 'verifying' && (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm mb-4">
                  ⏳ Payment Under Verification - Please wait while we confirm your payment
                </div>
              )}

              <button
                onClick={handleReceiptUpload}
                disabled={uploading || timeLeft === 0 || verificationStatus === 'approved'}
                className="btn-primary w-full disabled:opacity-50 mb-4"
              >
                {uploading ? 'Uploading...' : 'Upload Receipt'}
              </button>

              {verificationStatus !== 'approved' && (
                <Link
                  href={`/dashboard?ticketId=${guestData?.ticketId}`}
                  className="btn-secondary inline-block w-full"
                >
                  Go to Dashboard
                </Link>
              )}

              {verificationStatus === 'approved' && (
                <Link
                  href={`/dashboard?ticketId=${guestData?.ticketId}`}
                  className="btn-primary inline-block w-full"
                >
                  View Your Ticket 🎫
                </Link>
              )}

              <p className="text-white/40 text-sm mt-4">
                Your payment will be verified within 10-30 minutes
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
