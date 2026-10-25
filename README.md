# MinhDuHub

A dark-themed media sharing front end: React 18, TypeScript (strict), Vite, Tailwind CSS 3, React Router (HashRouter), React Hook Form + Zod, Lucide, Cloudinary.

## Run locally
```bash
npm install
cp .env.example .env   # optional; without it the app runs in demo mode
npm run dev
npm run build          # type-checks, then builds to dist/
```

## Cloudinary setup
1. Create a Cloudinary account and note your **cloud name**.
2. Settings → Upload → **Upload presets** → add a preset with **Signing mode: Unsigned**.
3. Restrict it: allowed formats `jpg,png,webp,gif,mp4,webm,mov`, a max file size, and an upload folder (e.g. `minhduhub/`).
4. Put the cloud name and preset name in `.env` (see `.env.example`). Never put an API secret in any `VITE_` variable.

Without these values the site shows sample content and the upload page is disabled.

## Deploy to GitHub Pages
1. Push to `main`. Repo Settings → Pages → Source: **GitHub Actions**.
2. Settings → Secrets and variables → Actions → add `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET`.
3. The workflow in `.github/workflows/deploy.yml` builds and publishes `dist/`.

`base: './'` plus HashRouter means routes work under any repository path without server rewrites. GitHub Pages serves static files only: no backend, no database.

## Architecture notes
- `src/lib/mediaUrls.ts` is the only place Cloudinary delivery URLs are built; `src/lib/cloudinary.ts` handles uploads.
- `src/services/mediaRepository.ts` defines `MediaRepository`. The shipped `LocalDemoRepository` reads bundled samples plus uploads kept in this browser's localStorage.

## Known limitations
- **Uploaded media metadata is local to one browser.** Cloudinary stores the file; titles, categories and tags are in localStorage. Other devices will not see them.
- View counts, trending and popular rankings are intentionally absent: nothing tracks real views.
- No authentication, "My uploads", or server-side moderation. The Report button calls a stub.
- Unsigned presets are visible to anyone; rely on the preset's restrictions and Cloudinary rate limiting.
- Newly uploaded videos may take a moment to process; the player offers "Try again".
- Sample items use Cloudinary's public `demo` cloud, which may change.
- Pinch-zoom is not implemented; zoom uses buttons and keyboard (+, -, 0, F, arrows).

## Adding a persistent public gallery
1. Build an API (e.g. Node + Postgres, or Supabase/Firebase) with a `media` table matching `src/types/media.ts`.
2. Add real authentication; check ownership and permissions on the server.
3. After a Cloudinary upload, POST the returned `public_id` and metadata to the API. Validate server-side (ideally verify the asset with the Cloudinary Admin API using a server-held secret).
4. Implement `MediaRepository` against that API (server-side search and pagination) and export it from `mediaRepository.ts`.
5. Add moderation: implement `report`, an admin review queue, and rate limits.
