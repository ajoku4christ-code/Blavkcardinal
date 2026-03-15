'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const EVENT_DATE = new Date('2026-03-28T20:00:00');

function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = EVENT_DATE.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-4 justify-center flex-wrap">
      <div className="countdown-box">
        <div className="countdown-number">{String(timeLeft.days).padStart(2, '0')}</div>
        <div className="countdown-label">Days</div>
      </div>
      <div className="countdown-box">
        <div className="countdown-number">{String(timeLeft.hours).padStart(2, '0')}</div>
        <div className="countdown-label">Hours</div>
      </div>
      <div className="countdown-box">
        <div className="countdown-number">{String(timeLeft.minutes).padStart(2, '0')}</div>
        <div className="countdown-label">Minutes</div>
      </div>
      <div className="countdown-box">
        <div className="countdown-number">{String(timeLeft.seconds).padStart(2, '0')}</div>
        <div className="countdown-label">Seconds</div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            <span className="text-[#FFD700]">Exclusive</span> House Party
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-sm text-white/70 hover:text-white transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D0D0D] via-[#1A1A2E] to-[#0D0D0D]" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFD700] rounded-full filter blur-[150px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#B8860B] rounded-full filter blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20">
          <div className="inline-block mb-6 px-6 py-2 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 text-[#FFD700] text-sm font-medium">
            March 28, 2026 • Abuja, Nigeria
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 glow-text" style={{ fontFamily: 'var(--font-heading)' }}>
            Exclusive<br />
            <span className="text-[#FFD700]">House Party</span>
          </h1>
          
          <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
            Join us for an unforgettable night of music, vibes, and celebration. 
            Limited to 100 guests - secure your spot now!
          </p>

          <div className="mb-12">
            <p className="text-sm text-white/50 uppercase tracking-widest mb-6">Event Starts In</p>
            <Countdown />
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/register" className="btn-primary text-lg">
              Get Your Gate Pass
            </Link>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FFD700]">₦10,000</div>
              <div className="text-sm text-white/50">Gate Fee</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-6">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Location</h3>
              <p className="text-white/60">Abuja, Nigeria</p>
            </div>
            <div className="glass-card p-6">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Guests</h3>
              <p className="text-white/60">Limited to 100</p>
            </div>
            <div className="glass-card p-6">
              <div className="text-4xl mb-4">🎫</div>
              <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Entry</h3>
              <p className="text-white/60">QR Code Verified</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12" style={{ fontFamily: 'var(--font-heading)' }}>
            Event <span className="text-[#FFD700]">Rules</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '🎫', title: 'Gate Pass Required', desc: 'Each guest must have a valid QR-coded gate pass for entry' },
              { icon: '⏰', title: 'Arrival Time', desc: 'Doors open at 8:00 PM. Late arrivals may not be admitted' },
              { icon: '📷', title: 'No Photography', desc: 'Respect the privacy of fellow guests' },
              { icon: '🚫', title: 'No Drugs/Weapons', desc: 'Zero tolerance policy for illegal substances and weapons' },
              { icon: '🎉', title: 'Have Fun', desc: 'Dance, vibe, and make unforgettable memories!' },
            ].map((rule, i) => (
              <div key={i} className="glass-card p-6 flex gap-4 items-start">
                <span className="text-3xl">{rule.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{rule.title}</h3>
                  <p className="text-white/60 text-sm">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-black/20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/40 text-sm mb-4">Founded by</p>
          <p className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
            Akinwale Gabriel Atoyebi
          </p>
          <p className="text-white/50 mt-2">CEO & Founder</p>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-white/40 text-sm">
          <p>© 2026 Exclusive House Party. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
