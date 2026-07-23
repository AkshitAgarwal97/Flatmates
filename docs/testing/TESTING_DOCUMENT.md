# Flatmates — QA Testing Document

| Field | Value |
|---|---|
| **Project** | Flatmates |
| **Version** | 1.0 |
| **Date** | 2026-05-17 |
| **Stack** | React + Redux Toolkit / Node.js + Express / MongoDB / Socket.io |
| **Hosting** | Vercel (frontend) · Render (backend) · Cloudinary (images) · MongoDB Atlas (DB) |

---

## Table of Contents

1. [Test Environment Setup](#1-test-environment-setup)
2. [Module: Authentication](#2-module-authentication)
3. [Module: Home Page](#3-module-home-page)
4. [Module: Property Listings](#4-module-property-listings)
5. [Module: Property Form](#5-module-property-form)
6. [Module: Property Detail](#6-module-property-detail)
7. [Module: Dashboard](#7-module-dashboard)
8. [Module: Messaging](#8-module-messaging)
9. [Module: User Profile](#9-module-user-profile)
10. [Module: Roommate Search](#10-module-roommate-search)
11. [Module: Real-Time (Socket.io)](#11-module-real-time-socketio)
12. [Cross-Cutting: API & Session](#12-cross-cutting-api--session)
13. [Cross-Cutting: Offline Behavior](#13-cross-cutting-offline-behavior)
14. [Cross-Cutting: Performance](#14-cross-cutting-performance)
15. [Cross-Cutting: Security](#15-cross-cutting-security)
16. [Cross-Cutting: Platform & Responsive](#16-cross-cutting-platform--responsive)
17. [Known Bugs & Risks](#17-known-bugs--risks)

---

## 1. Test Environment Setup

### Prerequisites
- Node.js 18+, npm 9+
- MongoDB Atlas cluster accessible
- Cloudinary account configured
- `.env` files configured for both frontend and backend

### Environment Variables Required

**Frontend (`.env`)**
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENCRYPTION_KEY=<secret>
```

**Backend (`.env`)**
```
MONGO_URI=<atlas-connection-string>
JWT_SECRET=<secret>
CLOUDINARY_CLOUD_NAME=<value>
CLOUDINARY_API_KEY=<value>
CLOUDINARY_API_SECRET=<value>
EMAIL_USER=<value>
EMAIL_PASS=<value>
CLIENT_URL=http://localhost:3000
```

### How to Run Locally
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm start
```

---

## 2. Module: Authentication

### TC-AUTH-01: User Registration (Happy Path)

| Field | Detail |
|---|---|
| **Precondition** | User is not registered |
| **Steps** | 1. Navigate to `/register` · 2. Enter valid name, email, password (≥6 chars) · 3. Click Register |
| **Expected** | JWT token stored in localStorage, user redirected to Dashboard, welcome email sent asynchronously |
| **Priority** | P0 — Critical |
| **Status** | ☐ Not Tested |

### TC-AUTH-02: Registration Validation Errors

| Field | Detail |
|---|---|
| **Precondition** | On register page |
| **Steps** | 1. Submit with empty fields · 2. Submit with invalid email · 3. Submit with password < 6 chars · 4. Submit with existing email |
| **Expected** | Appropriate validation error for each case: "Name is required", "Please include a valid email", password length error, "User already exists" |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

### TC-AUTH-03: Registration Edge Cases

| Field | Detail |
|---|---|
| **Precondition** | On register page |
| **Steps** | 1. Name >500 chars · 2. Email with special chars (`user+tag@test.com`) · 3. Password with unicode/emoji · 4. Double-click submit · 5. Network error during submit |
| **Expected** | 1-3: Handled gracefully · 4: Only one request (button disabled) · 5: Error alert, form preserved |
| **Priority** | P1 |
| **Status** | ☐ Not Tested |

### TC-AUTH-04: User Login (Happy Path)

| Field | Detail |
|---|---|
| **Precondition** | User is registered |
| **Steps** | 1. Navigate to `/login` · 2. Enter valid email & password · 3. Click Login |
| **Expected** | Password encrypted via AES before send, token returned, redirected to Dashboard |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

### TC-AUTH-05: Login Error Handling

| Field | Detail |
|---|---|
| **Precondition** | On login page |
| **Steps** | 1. Non-existent email · 2. Wrong password · 3. Empty fields · 4. Server 500 |
| **Expected** | 1: "User not found" · 2: "Invalid password" · 3: Validation errors · 4: Error dialog |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

### TC-AUTH-06: Password Reset — Full Flow

| Field | Detail |
|---|---|
| **Precondition** | User has account |
| **Steps** | 1. Go to `/forgot-password` · 2. Enter email → receive OTP · 3. Enter OTP → verified · 4. Enter new password → reset · 5. Login with new password |
| **Expected** | Each step transitions UI correctly (email→otp→password→success). Final login succeeds. |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

### TC-AUTH-07: Password Reset — Error Cases

| Field | Detail |
|---|---|
| **Precondition** | On forgot-password page |
| **Steps** | 1. Non-existent email · 2. Wrong OTP · 3. Expired OTP · 4. Password < 6 chars · 5. Reuse OTP |
| **Expected** | Appropriate error at each step. State doesn't advance on error. |
| **Priority** | P1 |
| **Status** | ☐ Not Tested |

### TC-AUTH-08: Logout

| Field | Detail |
|---|---|
| **Precondition** | User is logged in |
| **Steps** | 1. Click Logout |
| **Expected** | Token removed from localStorage, user state cleared, redirected to Home |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

---

## 3. Module: Home Page

### TC-HOME-01: Page Load & Search

| Field | Detail |
|---|---|
| **Precondition** | None |
| **Steps** | 1. Navigate to `/` · 2. Observe hero section · 3. Enter location + budget · 4. Select search type (Room/Property/Roommate) · 5. Click Search |
| **Expected** | Hero renders. Search navigates to correct route with correct query params. |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

### TC-HOME-02: Geolocation Auto-Detect

| Field | Detail |
|---|---|
| **Precondition** | Browser supports geolocation |
| **Steps** | 1. Allow geolocation permission on page load · 2. Click "My Location" button |
| **Expected** | City auto-populated via Nominatim reverse geocode |
| **Priority** | P1 |
| **Status** | ☐ Not Tested |

### TC-HOME-03: Geolocation Denied / Unsupported

| Field | Detail |
|---|---|
| **Precondition** | None |
| **Steps** | 1. Deny geolocation permission · 2. Test on browser without geolocation API |
| **Expected** | 1: Alert shown, loading stops · 2: "Geolocation is not supported" alert |
| **Priority** | P2 |
| **Status** | ☐ Not Tested |

---

## 4. Module: Property Listings

### TC-PROP-LIST-01: Load & Pagination

| Field | Detail |
|---|---|
| **Precondition** | Active properties exist in DB |
| **Steps** | 1. Navigate to `/properties` · 2. Scroll through list · 3. Navigate pages |
| **Expected** | 10 properties per page, correct total count, pagination controls work |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

### TC-PROP-LIST-02: Filters

| Field | Detail |
|---|---|
| **Precondition** | On properties page |
| **Steps** | Test each filter individually: property type, budget range, city, bedrooms, bathrooms, furnishing, amenities, gender, occupation, move-in date, pet-friendly |
| **Expected** | Each filter correctly narrows results. Active filter count badge updates. |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

### TC-PROP-LIST-03: Text Search

| Field | Detail |
|---|---|
| **Precondition** | On properties page |
| **Steps** | 1. Search by title keyword · 2. Search by city · 3. Search by description text |
| **Expected** | Regex search across title, description, city, street, state, zipCode |
| **Priority** | P1 |
| **Status** | ☐ Not Tested |

### TC-PROP-LIST-04: Empty & Error States

| Field | Detail |
|---|---|
| **Precondition** | On properties page |
| **Steps** | 1. Apply filters with no matches · 2. Simulate API 500 |
| **Expected** | 1: Empty state message · 2: Error state shown |
| **Priority** | P1 |
| **Status** | ☐ Not Tested |

---

## 5. Module: Property Form

### TC-PROP-FORM-01: Create Property (Happy Path)

| Field | Detail |
|---|---|
| **Precondition** | User logged in |
| **Steps** | 1. Go to `/properties/create` · 2. Fill title, description, type, listing type, address, price, availability · 3. Upload 1-5 images · 4. Submit |
| **Expected** | Property created, images uploaded to Cloudinary, redirect to `/properties` |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

### TC-PROP-FORM-02: Validation Errors

| Field | Detail |
|---|---|
| **Precondition** | On create property page |
| **Steps** | 1. Submit empty form · 2. Title >100 chars · 3. Description <20 chars · 4. Price=0 · 5. Missing city/country · 6. Missing availableFrom |
| **Expected** | Appropriate Formik validation error for each field |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

### TC-PROP-FORM-03: Image Upload Edge Cases

| Field | Detail |
|---|---|
| **Precondition** | On create property page |
| **Steps** | 1. Upload >5 images · 2. Upload non-image file · 3. Upload image >5MB · 4. Remove uploaded image |
| **Expected** | 1: Alert "Maximum 5 images" · 2: Alert "Only JPEG, JPG and PNG" · 3: Alert "size should not exceed 5MB" · 4: Image removed from preview |
| **Priority** | P1 |
| **Status** | ☐ Not Tested |

### TC-PROP-FORM-04: Pincode Auto-Fill & Geolocation

| Field | Detail |
|---|---|
| **Precondition** | On create property page |
| **Steps** | 1. Enter 6-digit Indian pincode · 2. Click "Use Current Location" |
| **Expected** | 1: City/state/country auto-populated via postalpincode API · 2: All address fields + coordinates filled via Nominatim |
| **Priority** | P1 |
| **Status** | ☐ Not Tested |

### TC-PROP-FORM-05: Edit Property

| Field | Detail |
|---|---|
| **Precondition** | User owns a property |
| **Steps** | 1. Go to `/properties/edit/:id` · 2. Verify form pre-populated · 3. Modify fields · 4. Submit |
| **Expected** | Form loads existing data, update succeeds, changes reflected |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

---

## 6. Module: Property Detail

### TC-PROP-DET-01: View Property

| Field | Detail |
|---|---|
| **Precondition** | Property exists |
| **Steps** | 1. Navigate to `/properties/:id` |
| **Expected** | All details displayed, view count incremented, image gallery works |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

### TC-PROP-DET-02: Save / Unsave Property

| Field | Detail |
|---|---|
| **Precondition** | User logged in |
| **Steps** | 1. Click save/heart icon · 2. Click again to unsave |
| **Expected** | Toggle works, alert shown, owner notified via email on save |
| **Priority** | P1 |
| **Status** | ☐ Not Tested |

### TC-PROP-DET-03: Contact Owner / Block / Report

| Field | Detail |
|---|---|
| **Precondition** | Viewing another user's property |
| **Steps** | 1. Click "Contact Owner" · 2. Click "Block User" · 3. Click "Report" |
| **Expected** | 1: Message dialog opens · 2: Confirm dialog → blocked → redirect · 3: Report dialog opens |
| **Priority** | P1 |
| **Status** | ☐ Not Tested |

### TC-PROP-DET-04: Unauthenticated Actions

| Field | Detail |
|---|---|
| **Steps** | 1. Save without login · 2. Contact without login · 3. Block without login |
| **Expected** | Alert "Please log in to..." for each action |
| **Priority** | P1 |
| **Status** | ☐ Not Tested |

### TC-PROP-DET-05: Owner Actions

| Field | Detail |
|---|---|
| **Precondition** | Viewing own property |
| **Steps** | 1. Click Edit · 2. Click Delete (confirm) |
| **Expected** | 1: Navigate to edit form · 2: Property deleted, redirect to listings |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

---

## 7. Module: Dashboard

### TC-DASH-01: Dashboard Load

| Field | Detail |
|---|---|
| **Precondition** | User logged in with listings and messages |
| **Steps** | 1. Navigate to `/dashboard` |
| **Expected** | Welcome message (time-based), stats cards (listings/views/saves), recent listings (max 3), recent messages (max 5), saved properties (max 3) |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

### TC-DASH-02: Empty States

| Field | Detail |
|---|---|
| **Precondition** | New user with no data |
| **Steps** | 1. Navigate to `/dashboard` |
| **Expected** | Empty states with CTAs: "Create Your First Listing", "Browse Properties" |
| **Priority** | P1 |
| **Status** | ☐ Not Tested |

---

## 8. Module: Messaging

### TC-MSG-01: Conversation List

| Field | Detail |
|---|---|
| **Precondition** | User has conversations |
| **Steps** | 1. Go to `/messages` · 2. Search by name · 3. Click a conversation |
| **Expected** | List sorted by last updated, unread badges shown, search filters correctly, click navigates to conversation |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

### TC-MSG-02: Send & Receive Messages

| Field | Detail |
|---|---|
| **Precondition** | In a conversation |
| **Steps** | 1. Type message · 2. Press Enter · 3. Other user sends message |
| **Expected** | Message sent and appears, real-time reception via socket, read receipts shown |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

### TC-MSG-03: Typing Indicators & Read Receipts

| Field | Detail |
|---|---|
| **Precondition** | Two users in conversation |
| **Steps** | 1. User A starts typing · 2. User B observes · 3. User B opens conversation |
| **Expected** | 1-2: Typing indicator shown · 3: Messages marked as read (double check) |
| **Priority** | P1 |
| **Status** | ☐ Not Tested |

### TC-MSG-04: Create Conversation

| Field | Detail |
|---|---|
| **Precondition** | User logged in |
| **Steps** | 1. Start new conversation from property detail · 2. Try messaging self · 3. Try messaging blocked user |
| **Expected** | 1: Conversation created with initial message · 2: 400 error · 3: 403 "Communication blocked" |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

### TC-MSG-05: Archive Conversation

| Field | Detail |
|---|---|
| **Precondition** | User has conversations |
| **Steps** | 1. Archive a conversation · 2. Refresh page |
| **Expected** | Conversation soft-deleted (isActive=false), no longer appears in list |
| **Priority** | P2 |
| **Status** | ☐ Not Tested |

### TC-MSG-06: Message Input Edge Cases

| Field | Detail |
|---|---|
| **Steps** | 1. Send empty message · 2. Press Enter while sending · 3. Shift+Enter |
| **Expected** | 1: Button disabled · 2: `isSending` prevents duplicate · 3: New line inserted |
| **Priority** | P1 |
| **Status** | ☐ Not Tested |

---

## 9. Module: User Profile

### TC-PROF-01: View Profile

| Field | Detail |
|---|---|
| **Precondition** | User logged in |
| **Steps** | 1. Go to `/profile` |
| **Expected** | Name, email, avatar, bio, preferences displayed. Completeness bar calculated. Verification badges shown. |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

### TC-PROF-02: Edit Profile

| Field | Detail |
|---|---|
| **Precondition** | On edit profile page |
| **Steps** | 1. Update name, bio, phone, age, budget, lifestyle · 2. Upload avatar · 3. Save |
| **Expected** | Form pre-populated, preview shown for avatar, save succeeds with redirect to `/profile` after 2s |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

### TC-PROF-03: Edit Profile Validation

| Field | Detail |
|---|---|
| **Steps** | 1. Empty first/last name · 2. Age <18 or >100 · 3. Bio >500 chars · 4. Max budget < min budget |
| **Expected** | Validation error for each case |
| **Priority** | P1 |
| **Status** | ☐ Not Tested |

---

## 10. Module: Roommate Search

### TC-ROOM-01: Search Roommates

| Field | Detail |
|---|---|
| **Steps** | 1. Go to `/roommates` · 2. Search by location · 3. Filter by budget |
| **Expected** | Returns users with `isRoommateListed: true`, filtered correctly |
| **Priority** | P1 |
| **Status** | ☐ Not Tested |

---

## 11. Module: Real-Time (Socket.io)

### TC-SOCK-01: Connection Lifecycle

| Field | Detail |
|---|---|
| **Steps** | 1. Login → verify socket connects · 2. Logout → verify disconnect · 3. Token expired → reconnect attempt |
| **Expected** | Socket connects with auth token, disconnects on logout, handles token errors |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

### TC-SOCK-02: Room Management

| Field | Detail |
|---|---|
| **Steps** | 1. Open conversation → joinConversation · 2. Leave conversation → leaveConversation |
| **Expected** | User receives messages only for joined rooms |
| **Priority** | P1 |
| **Status** | ☐ Not Tested |

### TC-SOCK-03: Multi-Tab Behavior

| Field | Detail |
|---|---|
| **Steps** | Open app in two tabs, send message from tab 1 |
| **Expected** | Both tabs receive the message (potential duplicate — document behavior) |
| **Priority** | P2 |
| **Status** | ☐ Not Tested |

---

## 12. Cross-Cutting: API & Session

### TC-API-01: Token Interceptor

| Field | Detail |
|---|---|
| **Steps** | 1. Login (token set) · 2. Make API call · 3. Verify Authorization header |
| **Expected** | `Bearer <token>` attached to every request via axios interceptor |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

### TC-API-02: 401 Auto-Logout

| Field | Detail |
|---|---|
| **Steps** | 1. Manually expire/invalidate token · 2. Make any API call |
| **Expected** | Token removed from localStorage, user redirected to `/login` |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

### TC-API-03: CORS

| Field | Detail |
|---|---|
| **Steps** | 1. Request from allowed origin · 2. Request from unknown origin |
| **Expected** | 1: Allowed · 2: CORS error |
| **Priority** | P1 |
| **Status** | ☐ Not Tested |

### TC-API-04: Routing Protection

| Field | Detail |
|---|---|
| **Steps** | 1. Access `/dashboard` without auth · 2. Access `/properties/create` without auth · 3. Access `/messages` without auth |
| **Expected** | All redirect to `/login` via PrivateRoute |
| **Priority** | P0 |
| **Status** | ☐ Not Tested |

---

## 13. Cross-Cutting: Offline Behavior

### TC-OFF-01: API Calls Offline

| Field | Detail |
|---|---|
| **Steps** | 1. Disable network · 2. Try loading properties · 3. Try submitting a form |
| **Expected** | User-friendly error message, no crash, form data preserved |
| **Priority** | P1 |
| **Status** | ☐ Not Tested |

### TC-OFF-02: Socket Reconnection

| Field | Detail |
|---|---|
| **Steps** | 1. Open conversation · 2. Disable network · 3. Re-enable network |
| **Expected** | Socket reconnects automatically, messages resume |
| **Priority** | P1 |
| **Status** | ☐ Not Tested |

---

## 14. Cross-Cutting: Performance

| Test | Expected | Status |
|---|---|---|
| Lazy loading via `React.lazy()` | Pages load on demand, smaller initial bundle | ☐ |
| Property list pagination (10/page) | No full DB load | ☐ |
| Image upload limits (5MB × 5) | Memory stays bounded | ☐ |
| Cloudinary CDN delivery | Images load fast globally | ☐ |
| Email notifications via `setImmediate()` | Non-blocking, API responds immediately | ☐ |
| Background job (`markExpiredProperties`) | Runs every 24h without blocking | ☐ |
| Socket events targeted to rooms | No broadcast to all users | ☐ |

---

## 15. Cross-Cutting: Security

| Test | Expected | Status |
|---|---|---|
| Passwords hashed with bcrypt (10 salt rounds) | Not stored in plain text | ☐ |
| Password excluded from API responses (`select('-password')`) | Never leaked | ☐ |
| Frontend AES encryption of passwords before transmission | Encrypted in transit | ☐ |
| JWT expires in 7 days | Limits token theft damage | ☐ |
| File upload validation (type + size) on frontend AND backend | Malicious files blocked | ☐ |
| Property ownership checked before edit/delete | Can't modify others' properties | ☐ |
| Conversation membership checked before read/send | Can't access others' chats | ☐ |
| Blocked users can't message each other | 403 on create and send | ☐ |
| `cleanAxios` used for external APIs | Auth headers not leaked to Nominatim | ☐ |

---

## 16. Cross-Cutting: Platform & Responsive

| Test | Expected | Status |
|---|---|---|
| Home search stacks vertically on mobile | `direction={{ xs: "column" }}` | ☐ |
| Dashboard: single column on mobile | Responsive grid | ☐ |
| Conversation: `calc(100vh - 180px)` height | No overflow on mobile | ☐ |
| Budget slider touch interaction | Works on mobile | ☐ |
| File input opens camera/gallery on mobile | Native picker | ☐ |
| `navigator.geolocation` unavailable | Graceful degradation | ☐ |
| `navigator.clipboard.writeText` on HTTP | Handled (may fail without HTTPS) | ☐ |
| `window.confirm()` dialogs | Render on all browsers | ☐ |

---

## 17. Known Bugs & Risks

| ID | Severity | Description | File | Line |
|---|---|---|---|---|
| BUG-001 | **High** | `resetPassword.pending` sets `loading: false` instead of `true` — spinner won't show | `passwordResetSlice.ts` | L119 |
| RISK-001 | **Critical** | JWT secret fallback `'your_jwt_secret'` if env var missing | `auth.ts` | L100 |
| RISK-002 | **High** | Encryption key fallback `flatmates_secure_key_123` hardcoded | `security.ts` | L5 |
| RISK-003 | **High** | No rate limiting on auth endpoints — brute force possible | `auth.ts` | All |
| RISK-004 | **Medium** | `console.log(budget)` left in production | `Home.tsx` | L94 |
| RISK-005 | **Medium** | Backend logs full request body on property create | `properties.ts` | L185 |
| RISK-006 | **Medium** | `passwordResetSlice` uses raw `axios` — no interceptors | `passwordResetSlice.ts` | All |
| RISK-007 | **Low** | `typingTimeout` in useEffect deps may cause re-render loops | `Conversation.tsx` | L156 |
| RISK-008 | **Medium** | Error stack exposed in property list API response | `properties.ts` | L422 |
| RISK-009 | **Medium** | No CSRF protection implemented | `server.ts` | — |

---

## Test Execution Summary

| Category | Total | Passed | Failed | Blocked | Not Tested |
|---|---|---|---|---|---|
| Authentication | 8 | | | | 8 |
| Home Page | 3 | | | | 3 |
| Property Listings | 4 | | | | 4 |
| Property Form | 5 | | | | 5 |
| Property Detail | 5 | | | | 5 |
| Dashboard | 2 | | | | 2 |
| Messaging | 6 | | | | 6 |
| User Profile | 3 | | | | 3 |
| Roommate Search | 1 | | | | 1 |
| Socket.io | 3 | | | | 3 |
| API & Session | 4 | | | | 4 |
| Offline | 2 | | | | 2 |
| Performance | 7 | | | | 7 |
| Security | 9 | | | | 9 |
| Platform | 8 | | | | 8 |
| **TOTAL** | **70** | | | | **70** |

---

*Document generated from codebase audit on 2026-05-17. Refer to `TESTING_CHECKLIST.md` for the granular checkbox list.*
