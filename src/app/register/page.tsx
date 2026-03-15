'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    paymentMethod: 'card',
  });
  const [guestData, setGuestData] = useState<{ guestId: number; ticketId: string } | null>(null);

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
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (formData.paymentMethod === 'bank_transfer') {
      setStep(3);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId: guestData?.guestId, ticketId: guestData?.ticketId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Payment initialization failed');
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
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
            Get Your <span className="text-[#FFD700]">Gate Pass</span>
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
                      ? 'bg-[#FFD700] text-white'
                      : 'bg-white/10 text-white/40'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-0.5 mx-2 ${step > s ? 'bg-[#FFD700]' : 'bg-white/10'}`} />
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
                <div>
                  <label className="block text-sm text-white/60 mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.paymentMethod === 'card'
                          ? 'border-[#FFD700] bg-[#FFD700]/10'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                    >
                      <div className="text-2xl mb-2">💳</div>
                      <div className="font-medium">Card Payment</div>
                      <div className="text-xs text-white/40">Instant confirmation</div>
                    </button>
                    <button
                      type="button"
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.paymentMethod === 'bank_transfer'
                          ? 'border-[#FFD700] bg-[#FFD700]/10'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      onClick={() => setFormData({ ...formData, paymentMethod: 'bank_transfer' })}
                    >
                      <div className="text-2xl mb-2">🏦</div>
                      <div className="font-medium">Bank Transfer</div>
                      <div className="text-xs text-white/40">Manual verification</div>
                    </button>
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
                Your Ticket ID: <span className="font-mono text-[#FFD700]">{guestData.ticketId}</span>
              </p>

              <div className="bg-[#16213E] rounded-xl p-6 mb-6 text-left">
                <h3 className="font-semibold mb-4">Payment Summary</h3>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60">Gate Pass</span>
                  <span>₦10,000</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold text-[#FFD700]">₦10,000</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 mb-4"
              >
                {loading
                  ? 'Processing...'
                  : formData.paymentMethod === 'card'
                  ? 'Pay with Card'
                  : 'Continue to Bank Details'}
              </button>

              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="text-6xl mb-6">🏦</div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                Bank Transfer Details
              </h2>
              <p className="text-white/60 mb-6">
                Transfer ₦10,000 to the account below and upload your proof of payment
              </p>

              <div className="bg-[#16213E] rounded-xl p-6 mb-6">
                <div className="text-left space-y-4">
                  <div>
                    <div className="text-sm text-white/40">Bank Name</div>
                    <div className="text-lg font-semibold">First Bank</div>
                  </div>
                  <div>
                    <div className="text-sm text-white/40">Account Number</div>
                    <div className="text-lg font-semibold font-mono">3084726193</div>
                  </div>
                  <div>
                    <div className="text-sm text-white/40">Account Name</div>
                    <div className="text-lg font-semibold">Exclusive Party</div>
                  </div>
                  <div>
                    <div className="text-sm text-white/40">Reference</div>
                    <div className="text-lg font-semibold font-mono text-[#FFD700]">{guestData?.ticketId}</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-white/60 mb-2">Upload Proof of Transfer</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FFD700] file:text-white file:cursor-pointer"
                />
              </div>

              <Link
                href={`/dashboard?ticketId=${guestData?.ticketId}`}
                className="btn-primary inline-block w-full"
              >
                Go to Dashboard
              </Link>

              <p className="text-white/40 text-sm mt-4">
                Your payment will be verified within 24 hours
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
