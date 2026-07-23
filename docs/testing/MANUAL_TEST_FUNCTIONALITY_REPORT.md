# Manual Test Functionality Report

## Environment
- Backend `http://localhost:5000` running via `npm run dev` (backend/server.ts:93)
- Frontend `http://localhost:3000` running via `npm start` (frontend/package.json:29)
- MongoDB local per `.env.example` (backend/.env.example:19)
- Email service not configured; warnings logged (backend/services/emailService.ts:41)
- Cloudinary not configured; image uploads skipped (backend/config/cloudinary.ts:21)

## Authentication
- Register: API flow succeeds; token returned (backend/routes/auth.ts:352)
- Login: API flow succeeds; token returned (backend/routes/auth.ts:352)
- Load current user: protected route returns user (backend/routes/auth.ts:?)
- Frontend registration page exists and redirects on auth (frontend/src/pages/auth/Register.tsx:66)

## User Profile
- Get profile: `GET /api/users/me` returns user (backend/routes/users.ts:37)
- Update profile: `PUT /api/users/me` accepts multipart avatar upload (backend/routes/users.ts:13)
- Frontend profile pages exist (frontend/src/pages/user/UserProfile.tsx:1)

## Property Management
- Create property: `POST /api/properties` succeeds without images (backend/routes/properties.ts:104)
- Update property: `PUT /api/properties/:id` supports image updates (backend/routes/properties.ts:407)
- Delete property: `DELETE /api/properties/:id` works with ownership check (backend/routes/properties.ts:507)
- Get property by id: `GET /api/properties/:id` increments views (backend/routes/properties.ts:378)
- List user listings: `GET /api/properties/user/listings` returns owned properties (backend/routes/properties.ts:349)

## Search & Filters
- List properties: `GET /api/properties` returns paginated results (backend/routes/properties.ts:312)
- Text search: `search` param matches `title` and `description` (backend/routes/properties.ts:248)
- Location filters: `city`, `country` supported (backend/routes/properties.ts:255)
- Price filters: `minPrice`, `maxPrice` supported (backend/routes/properties.ts:258)
- Availability: `availableFrom` supported (backend/routes/properties.ts:264)
- Features: `bedrooms`, `bathrooms`, `furnishing`, `amenities` supported (backend/routes/properties.ts:268)
- Preferences: `gender`, `petFriendly`, `lifestyle` supported (backend/routes/properties.ts:277)
- Advanced geo listings endpoints exist (backend/controllers/listingController.ts:31)

## Saved Properties
- Save/unsave: `POST /api/properties/:id/save` toggles saved list (backend/routes/properties.ts:538)
- Get saved: `GET /api/properties/user/saved` returns saved properties (backend/routes/properties.ts:327)

## Messaging
- Create conversation: `POST /api/messages/conversations` creates or returns existing (backend/routes/messages.ts:?)
- Send message: `POST /api/messages/conversations/:id` stores content and attachments (backend/routes/messages.ts:264)
- List conversations: `GET /api/messages/conversations` returns active conversations (backend/routes/messages.ts:39)
- Get conversation messages: `GET /api/messages/conversations/:id` marks messages read (backend/routes/messages.ts:220)
- Archive conversation: `DELETE /api/messages/conversations/:id` sets `isActive=false` (backend/routes/messages.ts:387)

## Notifications & Email
- Email notifications are implemented but require SMTP env (backend/services/emailService.ts:31)
- Notifications pushed to users on messaging events (backend/routes/messages.ts:356)

## Frontend Features
- Routing for public and protected pages present (testsprite.config.json:66)
- Map component and advanced filters exist (frontend/src/components/ui/PropertyMap.tsx:1, frontend/src/components/property/EnhancedFilters.tsx:1)
- Real-time messaging socket client present (frontend/src/services/socketService.ts:1)

## Manual Execution Highlights
- End-to-end smoke script passed (backend/scripts/e2e-smoke.js:78)
- Property listing retrieval verified via API
- Filters exercised: `city`, `search`, `minPrice`, `lifestyle`

## Summary
- Core flows functional: auth, profile, property CRUD, search, saved, messaging
- Image uploads for properties require Cloudinary configuration; without it, images are skipped