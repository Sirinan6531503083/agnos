# Agnos — Real-Time Patient Intake & Staff Monitoring

A responsive patient intake form and staff monitoring dashboard built with Next.js, Tailwind CSS and Supabase Realtime for cross-device synchronization.

This README explains how to set up the app locally, how realtime sync is wired (Supabase-only), and developer notes for the UI primitives and TODOs.

---

## Highlights

- Patient-facing intake form with validation, debounce and inactivity detection
- Staff dashboard with live queue, typing presence, and patient detail panel
 - Realtime: Supabase Realtime broadcast channel (cross-tab & cross-device)
- Reusable UI primitives: `components/ui/Card.tsx` and `components/ui/Badge.tsx` to centralize visual styles

---

## Quick Setup (Local)

1) Clone and install

```bash
npm install
```

2) Add environment variables (required for realtime)

Create `.env.local` at project root and set your Supabase project URL and anon (public) key. These are required for realtime to work across tabs/devices.

```env
# Supabase project base URL (no trailing /rest/v1)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# Supabase anon/public key (do NOT use service_role key in the client)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3) Run the Next.js dev server

```bash
npm run dev
```

Open http://localhost:3000 — open multiple tabs or devices and test realtime sync.

If you need cross-network testing (devices on different networks), host a WebSocket broker on a public endpoint or use a tunnel (ngrok) and set `NEXT_PUBLIC_WS_URL` accordingly.

---

## Realtime (Supabase) — notes

- The app uses Supabase Realtime (broadcasts on `agnos-broadcast`) when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are provided.
- Ensure you use the project base URL (e.g. `https://<project>.supabase.co`) — do not include `/rest/v1/` in `NEXT_PUBLIC_SUPABASE_URL`.
- Use the anon/public key from Supabase Project → Settings → API (not the service role key).

---

## Realtime Client Behavior

- Client code: `lib/realtime.ts` — uses Supabase Realtime broadcast channel `agnos-broadcast` for cross-tab and cross-device syncing.

- The Staff dashboard periodically sends `request_sync` (every 5s) and subscribes to incoming messages so staff sees updates without manual refresh.

Recommendations:
- Make sure `.env.local` contains the correct Supabase URL and anon key, then restart the dev server.
- Add reconnect/backoff logic in `lib/realtime.ts` for production reliability (I can add this for you).

---

## Optional persistence

Realtime uses Supabase broadcast events by default. If you need message persistence or an audit trail, use a Postgres table in your Supabase project and either:
- insert messages into a `messages` table and have the staff client listen via `supabase.from('messages').on('INSERT', ...)`, or
- persist on a backend process that subscribes to realtime events and writes to storage.

I can add a small SQLite/Postgres example if you want persistence in this project.

---

## Developer Notes

- UI primitives:
  - `components/ui/Card.tsx` centralizes the rounded card styles used across pages
  - `components/ui/Badge.tsx` standardizes pill/status visuals

- Accessibility / TODOs:
  - `components/ui/Select.tsx` uses a hybrid native/custom dropdown for touch devices. Accessibility (keyboard/ARIA) needs improvement — tracked as TODO.
  - Consider extracting the realtime logic in `PatientForm` into `usePatientRealtime` hook for reuse and clearer tests.

- Scripts available (package.json):
  - `npm run dev` — Next dev server
  - `npm run build` — build
  - `npm run start` — production start

## Project Structure

```
├── app/
│   ├── patient/
│   │   └── page.tsx        # Patient Intake Form entry
│   ├── staff/
│   │   └── page.tsx        # Staff Dashboard entry
│   ├── globals.css         # Tailwind v4 configuration
│   ├── layout.tsx          # Main layout and HTML setup
│   └── page.tsx            # Landing / role selector
├── components/
│   ├── patient/
│   │   └── PatientForm.tsx # Patient form, validation, sync (responsive)
│   ├── staff/
│   │   ├── PatientInfo.tsx # Live patient details panel
│   │   ├── StaffDashboard.tsx # Queue manager + filters
│   │   └── StatusIndicator.tsx # Small analytics card
│   └── ui/                 # Reusable UI primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Select.tsx
├── lib/
│   ├── supabase.ts         # Supabase client singleton
│   └── realtime.ts         # Realtime manager (Supabase-only)
├── package.json            # Scripts and dependencies
└── tsconfig.json           # TypeScript config
```

---

## Troubleshooting

If staff doesn't see updates across devices:
1. Ensure your WebSocket broker is running and reachable from both devices
2. Verify `NEXT_PUBLIC_WS_URL` is set and the app restarted
3. Check browser console/network logs for WS connect errors

For local cross-device testing behind NAT, use a tunnel (ngrok) and point `NEXT_PUBLIC_WS_URL` to the tunnel URL.

---

If you want, I can:
- add reconnect/backoff to `lib/realtime.ts` now
- create a minimal `usePatientRealtime` hook and move logic out of `PatientForm`
- create a short `README-DEV.md` with contributor setup and testing steps

Tell me which of the above you'd like next.
