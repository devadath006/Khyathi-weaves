# Khyathi Weaves — React Edition

A full React (Vite) rebuild of the original Express + server-rendered-HTML
Khyathi Weaves site. It talks to the **same Supabase project** (Postgres +
Storage + Auth) directly from the browser, so the Express server is no
longer needed for the storefront or admin panel.

## What changed vs. the original repo

- `server.js` (Express routes + HTML templating) → replaced by React
  components + `react-router-dom` client-side routing.
- `views/*.html` (Alpine.js + Tailwind CDN) → `src/pages/*.jsx`
  (React + Tailwind, compiled with PostCSS).
- Admin session cookie (`express-session`) → Supabase Auth session,
  checked client-side via `AuthContext` / `ProtectedRoute`.
- All `/api/*` Express endpoints → direct `supabase-js` calls
  (`supabase.from('sarees')...`, `supabase.storage.from('assets')...`).
  Your existing `supabase_schema.sql` RLS policies already allow public
  reads and (per the original schema) open writes, so no server-side
  service-role key is needed or used — everything runs on the public
  **anon** key.

## Pages

- `/` `/about` `/shop` `/gallery` `/contact` — public storefront
- `/admin/login` — admin sign-in (Supabase Auth email/password)
- `/admin` — inventory management (add/edit/delete sarees, toggle
  sold status, manage per-saree images, pick existing Storage images)
- `/admin/gallery` — gallery item CRUD
- `/admin/invoice` — plain sales invoice builder with print/PDF export
- `/admin/gst-invoice` — full GST tax invoice (seller/buyer GST details,
  HSN/SAC, CGST+SGST, discounts, amount-in-words, payment details)

## Setup

1. `cp .env.example .env` and fill in your Supabase project's URL and
   **anon/public** key (Project Settings → API in the Supabase dashboard).
   These are safe to expose in a frontend app — do **not** put your
   service-role key here.
2. `npm install`
3. `npm run dev` — starts the app at http://localhost:5173
4. `npm run build` — production build to `dist/`

Your Supabase project needs the same `sarees`, `saree_images`, and
`gallery_items` tables and the `assets` storage bucket that
`supabase_schema.sql` from the original repo sets up, plus an admin
user created in **Authentication → Users** (email/password) to log in
with.

## Notes / things worth revisiting

- The original schema's "Service full access" RLS policies have no
  `TO` clause, so — same as in the original app — writes are only
  gated by the admin UI, not by the database itself. For real
  production use, tighten those policies to require an authenticated
  Supabase session (`TO authenticated`) so the write API can't be hit
  directly by anonymous users.
- The admin panel's visual design (sidebar, colors, cards, modals,
  invoice/GST invoice layouts) is ported 1:1 from the original static
  `admin.html`, scoped under a `.kw-admin` CSS class in
  `src/pages/admin/admin.css` so it can't leak into the public
  storefront's Tailwind styles. PDF export uses the same `html2pdf.js`
  CDN bundle as the original, loaded once in `index.html`.
- The Storage image picker's "Single / Multi-select" mode tabs are
  visual + functional, but which mode a given "Choose from Storage"
  button opens in is still decided by the calling screen (primary
  image → single, gallery images → multi) — matching how the original
  buttons were wired.
- Image "optimize" URLs reuse the same Supabase render-image endpoint
  trick as the original (`getOptimizedUrl` in `src/lib/supabaseClient.js`).
