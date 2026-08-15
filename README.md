
 # Agnos — Real-time Patient Intake & Staff Monitoring

 Agnos is a front-end example app built with Next.js and Tailwind CSS. It demonstrates a responsive patient intake form and a real-time staff monitoring dashboard synchronized using Supabase Realtime.

Key parts:

- Patient Intake Form — responsive form for patients to enter their information from any device
- Staff Dashboard — responsive, real-time view for staff to monitor incoming patient data without page refresh


All real-time communication uses Supabase Realtime (broadcast channel), allowing different browsers/devices to synchronize immediately.

---


## Features

- Patient form: field validation, debounced field updates, inactivity detection
- Staff dashboard: live queue, typing presence, immediate patient detail view
- Realtime: Supabase Realtime broadcast channel (`agnos-broadcast`) for cross-tab and cross-device synchronization
- UI primitives: reusable components such as `components/ui/Card.tsx` and `components/ui/Badge.tsx`

---


## Tech stack

- Framework: Next.js (App Router)
- Realtime: Supabase Realtime (`@supabase/supabase-js`)
- Styling: Tailwind CSS
- Hosting / deployment: Vercel (recommended) or any static-friendly front-end hosting

---


## Local setup

1. Install dependencies

```bash
npm install
```

2. Create `.env.local` at the project root and set Supabase environment variables

```env
# Supabase project base URL, e.g. https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# Supabase anon/public key (do NOT use service_role key in client)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Important: `NEXT_PUBLIC_SUPABASE_URL` must be the project base URL (do not include `/rest/v1/`).

3. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000 and test by opening the app on another device or browser tab.

---


## Supabase Realtime notes

- The app broadcasts on the `agnos-broadcast` channel when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.
- Use the project base URL (e.g. `https://<project>.supabase.co`) and the public anon key from Supabase Project → Settings → API.
- Do not use the service role key in client code.

---


## Client behavior (summary)

- Key files: `lib/supabase.ts` (Supabase client singleton) and `lib/realtime.ts` (realtime manager)

Technical highlights:

- Message buffering (queue) to avoid message loss if messages are sent before the channel is ready
- Debounced field updates to reduce network chatter
- `isConnected` state exposed to UI so components can show connection status

Recommendation: add reconnect/backoff and health checks in `lib/realtime.ts` for production use — I can implement this if you wish.

---


## Project structure (short)

```
├── app/
│   ├── patient/          # Patient intake page
│   └── staff/            # Staff dashboard
├── components/
│   ├── patient/          # PatientForm.tsx
│   ├── staff/            # StaffDashboard.tsx, PatientInfo.tsx
│   └── ui/               # Button, Input, Select, Card, Badge
├── lib/
│   ├── supabase.ts       # Supabase client singleton
│   └── realtime.ts       # Realtime manager (Supabase-only)
├── public/               # favicon / static
├── package.json
└── tsconfig.json
```

---


## Deployment (Vercel)

1. Create a Vercel project and connect your GitHub repository
2. Add environment variables on Vercel (same values as `.env.local`):

  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Deploy — Vercel will run `npm run build` and publish the site

After deployment, test from multiple devices by opening the Staff Dashboard and submitting the patient form.

---


## Troubleshooting

If you do not see real-time updates:

1. Verify `.env.local` or Vercel environment variables — ensure `NEXT_PUBLIC_SUPABASE_URL` is the project base URL and `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
2. Check browser console for Supabase connection errors or 401/403 responses (wrong key)
3. Confirm the app uses the `lib/supabase.ts` singleton — creating multiple clients can produce GoTrueClient warnings

If you want persistence (store messages), write messages to a Postgres table in your Supabase project and have the staff client subscribe to INSERT events.

---


## Next steps / improvements

- Add reconnect/backoff and health checks to `lib/realtime.ts` for production reliability
- Extract realtime code into a `usePatientRealtime` hook for reuse and easier testing
- Improve accessibility for `components/ui/Select.tsx` (keyboard and screen reader support)

If you want, I can implement any of the above: reconnect/backoff, the `usePatientRealtime` hook, or a persistence example (Postgres). Tell me which to start.


