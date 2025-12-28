# Manual Test Bugs & Issues Report

## Critical
- Property image upload depends on Cloudinary env; without configuration, images are silently skipped during create/update (backend/config/cloudinary.ts:21, backend/routes/properties.ts:146). Impact: properties lack images in local/dev.

## High
- Frontend type error blocks `npm run type-check`: extra `userType` passed to `register` action (frontend/src/pages/auth/Register.tsx:101) not in `RegisterCredentials` (frontend/src/redux/slices/authSlice.ts:34). Impact: type-check fails.
- Root `package.json` includes `soket.io` typo package (package.json:26). Impact: unnecessary vulnerable placeholder dependency.
- Email service requires SMTP vars; without configuration logs warning and emails not sent (backend/services/emailService.ts:41). Impact: no email notifications in dev.

## Medium
- Min/Max price filters depend on existing dataset values; some queries return empty results, which may be confusing (backend/routes/properties.ts:258).
- Lifestyle filter only maps specific values (`Non-smoking`, `Pet lover`), others ignored (backend/routes/properties.ts:289). Impact: partial filter behavior.
- Root build/start scripts inconsistent with backend structure (`start`: `node backend/dist/server.js`) while backend package defines `main: dist/server.js` (backend/package.json:5, root package.json:1). Impact: confusion for deployment from root.

## Low
- Dev server logs deprecated webpack dev server options (frontend start logs). Impact: noise only.
- Vulnerabilities reported by `npm audit` in frontend and backend dependencies. Impact: consider audit fixes.
- No rate-limit middleware observed in active backend folder; security packages exist in deployment variant but not applied here (backend/server.ts:?). Impact: consider enabling.

## Observations
- Upload directories created under `dist/uploads`, messages use local disk storage and work without Cloudinary (backend/routes/messages.ts:200, server.ts:55).
- Static assets served from `dist/public` and frontend build in prod mode (backend/server.ts:70).

## Recommendations
- Add fallback to local disk storage for property images when Cloudinary is not configured.
- Fix `Register.tsx` to align types or adjust thunk signature.
- Remove `soket.io` from root `package.json`.
- Configure SMTP in `.env` for email testing or mock email transport.
- Expand lifestyle mappings and document supported values.