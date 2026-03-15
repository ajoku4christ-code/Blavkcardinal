# Active Context: Exclusive House Party Gate Pass System

## Current State

**Project Status**: ✅ Complete and ready for deployment

A full-stack event ticketing web application for a private house party in Abuja, Nigeria. Features payment processing via BANK TRANSFER ONLY, QR code tickets with email, guest management, and admin verification dashboard.

## Recently Completed

- [x] System architecture design (SPEC.md)
- [x] Database schema (SQLite with better-sqlite3)
- [x] Landing page with countdown timer to March 28, 2026
- [x] Registration system with BANK TRANSFER ONLY payment
- [x] 10-minute countdown timer for payment
- [x] Receipt upload functionality with API
- [x] Digital gate pass with QR code (ticket_id + email encoding)
- [x] Guest dashboard for ticket viewing/download/PDF
- [x] Admin dashboard for receipt verification
- [x] Automatic QR ticket email on payment approval
- [x] Anti-duplicate registration system
- [x] 100 guest limit enforcement
- [x] Email confirmation system (Nodemailer)
- [x] TypeScript and ESLint configuration
- [x] Production build verified

## Project Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Landing page with countdown | ✅ |
| `src/app/register/page.tsx` | Registration, bank details, receipt upload | ✅ |
| `src/app/dashboard/page.tsx` | Guest ticket view, PDF download | ✅ |
| `src/app/admin/page.tsx` | Admin login | ✅ |
| `src/app/admin/dashboard/page.tsx` | Receipt verification, guest management | ✅ |
| `src/app/api/guests/route.ts` | Guest CRUD API | ✅ |
| `src/app/api/payment/route.ts` | Payment processing | ✅ |
| `src/app/api/upload-receipt/route.ts` | Receipt upload API | ✅ |
| `src/app/api/admin/route.ts` | Admin actions + email tickets | ✅ |
| `src/lib/db.ts` | Database operations | ✅ |
| `src/app/globals.css` | Tailwind + custom styles | ✅ |

## Technology Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes
- **Database**: SQLite (better-sqlite3)
- **Payments**: Bank Transfer ONLY (manual verification)
- **QR Codes**: qrcode library (encodes ticket_id|email)
- **Email**: Nodemailer

## Key Features

1. **Landing Page**: Event info, countdown timer, CTA
2. **Payment System**: Bank Transfer ONLY with receipt upload
3. **Gate Pass**: QR code tickets with unique IDs (encodes ticket_id + email)
4. **Guest Dashboard**: View/download ticket as PDF
5. **Admin Dashboard**: View receipts, approve/reject payments, auto-send tickets

## Payment Flow

1. User registers with name, email, phone
2. Gets bank transfer details (Access Bank, ₦10,000)
3. 10-minute countdown timer starts
4. User uploads payment receipt
5. Status shows "Payment Under Verification"
6. Admin reviews receipt in dashboard
7. Admin approves → ticket email sent + QR generated
8. User can download PDF ticket

## Configuration Required

Edit `.env.local` for production:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: Email configuration
- `NEXT_PUBLIC_BASE_URL`: Base URL for ticket links

## Current Focus

Project is complete with bank transfer-only flow. All features working:
- Registration with bank transfer
- Receipt upload and storage
- Admin verification with receipt viewing
- Automatic QR ticket email on approval
- PDF/Print ticket download

## Session History

| Date | Changes |
|------|---------|
| 2026-03-14 | Built complete Exclusive House Party ticketing system |
| 2026-03-14 | Implemented all core features: landing, payment, tickets, admin |
| 2026-03-14 | Verified build and lint pass |
| 2026-03-15 | Fixed payment system: bank transfer only, receipt upload, admin verification, QR email, PDF download |
