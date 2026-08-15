# Agnos Real-Time Patient Intake & Staff Monitoring System

A responsive, real-time patient intake form and clinical staff monitoring dashboard built with **Next.js**, **Tailwind CSS**, **Supabase**, and **WebSockets**.

Live Sync Demonstration:
- **Patient Form**: A clean, responsive form with inputs for personal and emergency details, complete with client-side validation and DB insertion.
- **Staff Dashboard**: A live monitor dashboard preloading historical data from Supabase and tracking active queue numbers, typing focuses, and connections.

---

## 🚀 Key Features & UX Additions

### 1. Triple-Engine Real-Time Sync
*   **Supabase Realtime Broadcast**: Uses Supabase Channels to synchronize data instantly in production without needing a custom WebSocket server.
*   **WebSockets**: Integrates with a local Node.js WebSocket server (`ws-server.js`) or any hosted WebSocket broker via `NEXT_PUBLIC_WS_URL`.
*   **HTML5 `BroadcastChannel` Fallback**: Automatically synchronizes data in real-time across tabs in the same browser with **zero configuration or server setup** required. Perfect for testing.

### 2. Permanent Database Storage & Preloading
*   Completed intake forms are permanently stored in the Supabase database table `patient_intakes` upon submission.
*   When the Staff Dashboard is loaded or refreshed, it queries the database and preloads historical entries into the queue list, preventing data loss.

### 3. Typing Presence & Highlight Indicators
*   When a patient clicks on a field, the dashboard highlights that specific card in real-time with an **"editing..."** pill and a focus ring, letting staff know exactly what field is being filled.
*   Typing inputs are debounced by **150ms** to prevent socket congestion while maintaining instantaneous visual fluidity.

### 4. Patient State Machine (Presence)
*   **Filling Form**: The patient is actively focused on the form and typing.
*   **Inactive**: Triggers automatically if the patient stops typing for more than **10 seconds**, or if the patient closes/refreshes the tab.
*   **Submitted**: Validates all fields, inserts them into Supabase, and locks the form.

---

## 💾 Supabase Schema Setup

Create a table named `patient_intakes` in your Supabase project using the **SQL Editor**:

```sql
create table patient_intakes (
  id uuid default gen_random_uuid() primary key,
  session_id text not null unique,
  first_name text not null,
  middle_name text,
  last_name text not null,
  dob date not null,
  gender text not null,
  phone text not null,
  email text,
  address text not null,
  preferred_language text not null,
  nationality text not null,
  emergency_name text,
  emergency_relationship text,
  religion text,
  status text not null default 'submitted',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) policies
alter table patient_intakes enable row level security;
create policy "Allow public read and write" on patient_intakes for all using (true) with check (true);
```

---

## 🛠️ Project Structure

```text
├── app/
│   ├── patient/
│   │   └── page.tsx        # Patient Intake Form Entry Layout
│   ├── staff/
│   │   └── page.tsx        # Staff Dashboard Entry Layout
│   ├── globals.css         # Tailwind v4 configuration
│   ├── layout.tsx          # Main layout metadata and HTML setup
│   └── page.tsx            # Welcome Landing Page (Role selector)
├── components/
│   ├── patient/
│   │   └── PatientForm.tsx # Core patient form logic, validation, and sync
│   ├── staff/
│   │   ├── PatientInfo.tsx # Live patient details grid with active highlights
│   │   ├── StaffDashboard.tsx # Queue manager, active session state, search filters
│   │   └── StatusIndicator.tsx # Reusable analytics status cards
│   └── ui/                 # Reusable UI component library
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Select.tsx
├── lib/
│   ├── realtime.ts         # Real-time Sync manager (Supabase / WebSockets / BroadcastChannel)
│   └── supabase.ts         # Supabase client config with fallback support
├── package.json            # Scripts and dependency versions
├── ws-server.js            # Lightweight local WebSocket server
└── tsconfig.json           # TS rules
```

---

## ⚙️ Quick Start Guide

### 1. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
*(If keys are omitted, the app will display a console warning and fall back to local WebSockets / BroadcastChannel sync).*

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
*(Optionally run `npm run ws` if you wish to test local WebSockets without Supabase).*
