# Agnos — Real-Time Patient Intake & Staff Monitoring

A responsive patient intake form and staff monitoring dashboard built with Next.js, Tailwind CSS and a multi-tier realtime sync system (BroadcastChannel and WebSocket).

This README explains how to set up the app locally (including the local WebSocket server), how the realtime sync is wired, and developer notes for the UI primitives and TODOs.

---

## Highlights

- Patient-facing intake form with validation, debounce and inactivity detection
- Staff dashboard with live queue, typing presence, and patient detail panel
- Multi-layer realtime: `BroadcastChannel` (same-browser tabs) and optional WebSocket broker (`ws-server.js`)
- Reusable UI primitives: `components/ui/Card.tsx` and `components/ui/Badge.tsx` to centralize visual styles

---

## Quick Setup (Local)

1) Clone and install

```bash
npm install
```

2) Add environment variables (optional but recommended)

Create `.env.local` at project root and set as needed:

```env
# Optional: point to your WebSocket broker (default used is ws://<host>:8080)
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

3) Run the local WebSocket broadcast server (optional — used for cross-device sync)

```bash
# run the lightweight server provided in the repo
npm run ws
```

4) Run the Next.js dev server

```bash
npm run dev
```

Open http://localhost:3000 — open multiple tabs or devices and test realtime sync.

If you need cross-network testing (devices on different networks), run `npm run ws` on a public host or use a tunnel (ngrok) and set `NEXT_PUBLIC_WS_URL` accordingly.

---

## WebSocket Server (local) — notes

- The repo includes `ws-server.js`: a minimal broadcast server (uses `ws`) that echoes/forwards incoming JSON messages to all other connected clients.
- Start it with `npm run ws`. Default port is `8080` (or set `WS_PORT` env var).
- For production, run behind a reverse proxy (nginx) or use a managed message broker.

---

## Realtime Client Behavior

- Client code: `lib/realtime.ts` — it uses two sync methods in priority order:
  1. `BroadcastChannel` for same-browser-tab sync (zero-config)
  2. WebSocket to `NEXT_PUBLIC_WS_URL` (or ws://<host>:8080 by default)

- Staff dashboard now periodically sends `request_sync` (every 5s) and also subscribes to incoming messages — so staff sees updates without manual refresh.

Recommendations:
- Set `NEXT_PUBLIC_WS_URL` if you run the `ws-server.js` on a different host.
- Add reconnect/backoff logic in `lib/realtime.ts` for production reliability (I can add this for you).

---

## Optional database integration

Realtime synchronization works using `BroadcastChannel` (same-browser tabs) and an optional WebSocket broker (`ws-server.js`), which is sufficient for cross-tab and cross-device syncing.

If you need persistent storage, you can wire any server-side datastore (Postgres, MySQL, SQLite, etc.) into the server component that accepts and persists messages from the WebSocket server. If you'd like, I can add a small SQLite example and persistence layer.

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
  - `npm run ws` — local WebSocket broadcast server

---

## Troubleshooting

- If staff doesn't see updates across devices:
  1. Ensure `ws-server.js` is running and reachable from both devices
  2. Verify `NEXT_PUBLIC_WS_URL` is set and the app restarted
  3. Check browser console/network logs for WS connect errors

- For local cross-device testing behind NAT, use a tunnel (ngrok) and point `NEXT_PUBLIC_WS_URL` to the tunnel URL.

---

If you want, I can:
- add reconnect/backoff to `lib/realtime.ts` now
- create a minimal `usePatientRealtime` hook and move logic out of `PatientForm`
- create a short `README-DEV.md` with contributor setup and testing steps

Tell me which of the above you'd like next.
