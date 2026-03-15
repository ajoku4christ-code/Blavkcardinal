'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (credentials.password !== credentials.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (credentials.password.length < 4) {
      setError('Password must be at least 4 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Setup failed');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-8 transition-colors">
          ← Back to Home
        </Link>

        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">⚙️</div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
              Admin <span className="text-[#FFD700]">Setup</span>
            </h1>
            <p className="text-white/40 mt-2">Set your admin credentials</p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="text-5xl mb-4">✓</div>
              <p className="text-green-400 mb-4">Admin credentials set successfully!</p>
              <p className="text-white/40 text-sm">Redirecting to dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Username</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter username"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Password</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Enter password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Confirm password"
                    value={credentials.confirmPassword}
                    onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                {error && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Setting up...' : 'Set Admin Credentials'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
