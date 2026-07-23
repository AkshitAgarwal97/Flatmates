# Flatmates — Comprehensive Testing Checklist

> Generated from exhaustive codebase audit. Grouped by feature/screen.

---

## 1. Authentication — Registration (`Register.tsx`, `POST /api/auth/register`)

### Happy Paths
- [ ] Register with valid name, email, password (≥6 chars) = token returned, redirected to dashboard
- [ ] Password is encrypted via `encryptData()` before transmission = backend decrypts successfully
- [ ] Welcome email is sent asynchronously after registration = no blocking of response
- [ ] JWT token stored in `localStorage` = subsequent API calls include `Authorization` header

### Edge Cases & Errors
- [ ] Submit with empty name = validation error "Name is required"
- [ ] Submit with invalid email format = validation error "Please include a valid email"
- [ ] Submit with password < 6 chars = validation error shown
- [ ] Register with already-existing email = 400 "User already exists"
- [ ] Submit with all fields empty = all validation errors shown simultaneously
- [ ] Extremely long name (>500 chars) = handled gracefully (no crash)
- [ ] Email with special chars (e.g. `user+tag@example.com`) = accepted or rejected consistently
- [ ] Password with unicode/emoji characters = encrypted and stored correctly
- [ ] `REACT_APP_ENCRYPTION_KEY` env var missing = fallback key `flatmates_secure_key_123` used
- [ ] Backend `decryptData()` fails on corrupted ciphertext = 400 error, not 500
- [ ] Network error during registration = error alert shown, form state preserved
- [ ] Double-click submit button = only one request sent (loading state disables button)
- [ ] Welcome email service fails = registration still succeeds (fire-and-forget)

---

## 2. Authentication — Login (`Login.tsx`, `POST /api/auth/login`)

### Happy Paths
- [ ] Login with valid credentials = token returned, user redirected to dashboard
- [ ] Password encrypted on frontend before sending = backend decrypts and compares
- [ ] "Remember me" or persistent session = token persists in localStorage across tabs

### Edge Cases & Errors
- [ ] Login with non-existent email = 400 "User not found" with `type: USER_NOT_FOUND`
- [ ] Login with wrong password = 400 "Invalid password" with `type: INVALID_PASSWORD`
- [ ] Login with empty password = 400 validation error
- [ ] Login with empty email = 400 validation error
- [ ] Decrypted password is empty string = 400 "Password is required" (backend check L133)
- [ ] Social login user tries local login without password set = appropriate error
- [ ] Server error (500) during login = error dialog displayed
- [ ] Rapid repeated failed logins = no rate limiting crash (note: no rate limiter in code)
- [ ] Login while already authenticated = redirect to dashboard or no-op

---

## 3. Authentication — Password Reset (`passwordResetSlice.ts`, `/api/auth/forgot-password|verify-otp|reset-password`)

### Happy Paths
- [ ] Step 1: Enter valid email = OTP sent, UI moves to OTP step
- [ ] Step 2: Enter correct OTP = verified, UI moves to password step
- [ ] Step 3: Enter new password (≥6 chars) = password reset, UI shows success
- [ ] After reset, login with new password = success

### Edge Cases & Errors
- [ ] Step 1: Non-existent email = 404 "User not found"
- [ ] Step 1: Invalid email format = 400 validation error
- [ ] Step 2: Wrong OTP = 400 "Invalid or expired OTP"
- [ ] Step 2: Expired OTP (TTL in OTP model) = 400 "Invalid or expired OTP"
- [ ] Step 3: Password < 6 chars = validation error
- [ ] Step 3: OTP reused after password reset = fails (OTP deleted after use)
- [ ] Navigate back from OTP step = state preserved or reset properly
- [ ] `resetState()` action = all state cleared, back to email step
- [ ] Email service down during OTP send = 500 error shown
- [ ] **BUG**: `resetPassword.pending` sets `loading: false` instead of `true` (L119) = loading spinner won't show

---

## 4. Session & Token Management (`api.ts` interceptors, `authSlice.ts`)

- [ ] Token present in localStorage = attached to all API requests via interceptor
- [ ] Token missing = API calls proceed without auth header (public routes work)
- [ ] 401 response from any API = token removed from localStorage, user redirected to login
- [ ] `loadUser()` on app mount = fetches user data if token exists
- [ ] `loadUser()` with expired/invalid token = 401 handled, user logged out
- [ ] `logout()` action = token removed, user state cleared, redirect to home
- [ ] Multiple tabs open = logout in one tab doesn't auto-logout others (no cross-tab sync)
- [ ] Token format tampered = backend rejects, 401 returned
- [ ] JWT expiry (7 days) = after 7d, next request returns 401, user must re-login

---

## 5. Home Page (`Home.tsx`)

### Happy Paths
- [ ] Page loads = hero section with search box visible
- [ ] Auto-detect location on mount via `navigator.geolocation` = city populated in search field
- [ ] Click "My Location" button = reverse geocode via Nominatim, location field populated
- [ ] Toggle search type (Room / Property / Roommate) = correct type selected
- [ ] Search with location + budget = navigates to `/properties?search=...&maxPrice=...` or `/roommates?...`
- [ ] Search type "room" = appends `type=room` to URL
- [ ] Search type "property" = appends `type=apartment,house,studio`
- [ ] Search type "roommate" = navigates to `/roommates` with `maxBudget`
- [ ] "List a Property" card = authenticated user goes to `/properties/create`, unauthenticated to `/register`

### Edge Cases & Errors
- [ ] Geolocation denied by user = error logged, `loadingLocation` set to false, alert shown
- [ ] Geolocation not supported by browser = alert "Geolocation is not supported"
- [ ] Nominatim API fails = error caught, location field stays empty
- [ ] Nominatim returns no city/town/village = location field stays empty
- [ ] Search with empty location and empty budget = navigates with no params
- [ ] Budget with negative number = `Number(budget)` produces negative, API handles
- [ ] Budget with non-numeric string = `Number(budget)` produces NaN
- [ ] Toggle button deselected (newType = null) = type doesn't change (guarded by `if (newType !== null)`)
- [ ] External image (Unsplash hero) fails to load = grey background still visible
- [ ] SEO structured data renders valid JSON-LD = no parsing errors

---

## 6. Property Listing / Search (`PropertyList`, `EnhancedFilters.tsx`, `GET /api/properties`)

### Happy Paths
- [ ] Page loads = properties fetched with default filters, pagination works
- [ ] Filter by property type (apartment/house/room/studio) = results update
- [ ] Filter by budget range slider (0 - 1Cr) = `minPrice/maxPrice` sent to API
- [ ] Filter by city dropdown = results scoped to city
- [ ] Filter by bedrooms/bathrooms = correct filtering
- [ ] Filter by amenities (multi-select chips) = `$all` query on backend
- [ ] Filter by lifestyle preferences = results filtered
- [ ] Filter by gender preference = `$in [gender, 'any']` query
- [ ] Filter by occupation = exact match
- [ ] Filter by move-in date = `availableFrom <= date`
- [ ] Filter by pet-friendly = `preferences.pets: true`
- [ ] Text search = regex on title, description, city, street, state, zipCode
- [ ] Pagination = page/limit params, correct total count
- [ ] Clear all filters = reset to defaults
- [ ] Active filter count badge updates correctly
- [ ] URL query params pre-populate filters (from Home search)
- [ ] Authenticated user sees match scores on properties
- [ ] Boosted/featured properties sorted first

### Edge Cases & Errors
- [ ] No results found = empty state message shown
- [ ] Budget slider at extremes (0 and 10M) = no price filter applied
- [ ] Search with special regex chars (e.g. `(`, `*`) = no regex crash on backend
- [ ] Very large page number = empty results, no crash
- [ ] API returns 500 = error state shown
- [ ] Blocked user's properties excluded from results (if authenticated)
- [ ] Location radius search with lat/lng/radius params = bounding box filter applied
- [ ] `propertyType` query param with comma-separated values = handled correctly
- [ ] Properties older than 30 days auto-marked inactive by background job = not shown in active filter

---

## 7. Property Form — Create & Edit (`PropertyForm.tsx`, `POST|PUT /api/properties`)

### Happy Paths
- [ ] Create: Fill all required fields = property created, redirected to `/properties`
- [ ] Edit: Load existing property = form pre-populated with current values
- [ ] Upload up to 5 images (JPEG/PNG, ≤5MB each) = previews shown
- [ ] Remove an image = removed from preview, tracked in `removedImages`
- [ ] Pincode auto-fill: Enter 6-digit pincode = city/state/country auto-populated via `api.postalpincode.in`
- [ ] "Use Current Location" = reverse geocode fills street/city/state/zip/country/coordinates
- [ ] Add/remove amenities dynamically (FieldArray)
- [ ] Add/remove house rules dynamically
- [ ] Set preferences (gender, occupation, lifestyle, ageRange)
- [ ] Formik validation = errors shown on blur/submit
- [ ] After create = `getProperties({})` dispatched to refresh list

### Edge Cases & Errors
- [ ] Title > 100 chars = validation error
- [ ] Description < 20 chars = validation error
- [ ] Price = 0 or negative = validation error "Price must be positive"
- [ ] Brokerage negative = validation error
- [ ] Missing city = validation error "City is required"
- [ ] Missing country = validation error "Country is required"
- [ ] Missing availableFrom = validation error
- [ ] Upload > 5 images = alert "Maximum 5 images allowed", upload blocked
- [ ] Upload non-image file = alert "Only JPEG, JPG and PNG images are allowed"
- [ ] Upload image > 5MB = alert "Image size should not exceed 5MB"
- [ ] Pincode API fails = error logged, fields unchanged
- [ ] Pincode returns "Error" status = warning logged
- [ ] Geolocation denied = error alert with specific message (permission denied/unavailable/timeout)
- [ ] Geolocation not supported = alert shown
- [ ] Edit mode: property not found = loading spinner (no error state?)
- [ ] Edit mode: user is not owner = backend returns 401 "Not authorized"
- [ ] Cloudinary upload fails = 500 error with message
- [ ] FormData serialization of nested objects (address, price) = `parseFormDataJSON` handles correctly
- [ ] Submit while already submitting = button disabled by `isSubmitting`
- [ ] `enableReinitialize` on Formik = form updates when property data loads in edit mode
- [ ] Backend validates `propertyType` enum = 'apartment' accepted (L109 includes it)

---

## 8. Property Detail (`PropertyDetail.tsx`, `GET /api/properties/:id`)

### Happy Paths
- [ ] Page loads with valid ID = property details displayed
- [ ] View count incremented on each visit
- [ ] Image gallery renders with lightbox
- [ ] Save/unsave property = heart icon toggles, alert shown
- [ ] Share dialog = copy link to clipboard
- [ ] Contact owner = message dialog opens (if authenticated)
- [ ] Owner sees edit/delete buttons, non-owner doesn't
- [ ] Owner info card shows name, avatar, member since, last active, response time
- [ ] Amenities, preferences, house rules sections conditionally rendered
- [ ] SEO structured data (RealEstateListing) rendered

### Edge Cases & Errors
- [ ] Invalid property ID = 404 "Property not found"
- [ ] Malformed ObjectId = 404 (backend catches `err.kind === 'ObjectId'`)
- [ ] Save property while unauthenticated = alert "Please log in to save properties"
- [ ] Contact owner while unauthenticated = alert "Please log in to contact the owner"
- [ ] Block user = confirm dialog, POST to `/api/users/block/:id`, redirect to properties
- [ ] Block while unauthenticated = alert
- [ ] Report listing = report dialog opens (if authenticated)
- [ ] Delete property = confirm dialog, property removed, redirect
- [ ] Delete property fails = error alert
- [ ] Property has no images = gallery handles empty array
- [ ] `price.amount` is null/undefined = displays "N/A" (L350 uses `?? "N/A"`)
- [ ] Owner has phone number = phone shown instead of "Contact Owner" button
- [ ] Owner has no phone = "Contact Owner" button shown
- [ ] Match score displayed if authenticated and score exists
- [ ] Email notification sent to owner on view (authenticated, not self-view)

---

## 9. Dashboard (`Dashboard.tsx`)

### Happy Paths
- [ ] Page loads = user's listings, recent messages, saved properties fetched
- [ ] Welcome message changes by time of day (morning/afternoon/evening)
- [ ] Stats cards: total listings, total views, total saves, saved count
- [ ] Listings show max 3, with "View All" link
- [ ] Messages show max 5 conversations with unread badge
- [ ] Saved properties show max 3

### Edge Cases & Errors
- [ ] User has no listings = empty state with "Create Your First Listing" CTA
- [ ] User has no messages = empty state with "Browse Properties" CTA
- [ ] User has no saved properties = empty state
- [ ] Loading state = skeleton placeholders shown
- [ ] `userListings` is null/undefined = `totalListings` defaults to 0 (L81)
- [ ] Property missing `views` or `saves` fields = defaults to 0
- [ ] Conversation participant is deleted = `otherParticipant` could be undefined
- [ ] `lastMessage` is null = empty string shown (L375)
- [ ] `lastMessage.createdAt` is empty string = `new Date("")` produces Invalid Date

---

## 10. Messaging — Conversation List (`ConversationList.tsx`)

### Happy Paths
- [ ] Page loads = conversations fetched, sorted by last updated
- [ ] Search conversations by participant name = filtered list
- [ ] Click conversation = navigates to `/messages/:id`, marks as read via socket
- [ ] Unread count badge shown on conversations with unread messages
- [ ] New conversation button = dialog opens
- [ ] Archive conversation = menu action dispatches archive
- [ ] Property chip shown on property-related conversations

### Edge Cases & Errors
- [ ] No conversations = empty state with "Start Chat" button
- [ ] Search with no matches = "No matching conversations" message
- [ ] Participant name is null/undefined = filtered out (L155)
- [ ] `lastMessage` is undefined = "No messages yet" shown
- [ ] `lastMessage` has attachments = "Attachment" icon shown
- [ ] Time formatting: just now, minutes, hours, days, date
- [ ] Socket `markMessagesAsRead` called on conversation click

---

## 11. Messaging — Conversation (`Conversation.tsx`)

### Happy Paths
- [ ] Messages loaded and displayed grouped by date
- [ ] Send text message = dispatched, input cleared, scrolled to bottom
- [ ] Real-time messages via socket = new messages appear instantly
- [ ] Typing indicator = `socketService.typing()` called
- [ ] Read receipts = single check (sent) vs double check (read) shown
- [ ] Date headers: "Today", "Yesterday", or formatted date
- [ ] Property card shown if conversation has associated property
- [ ] Back button = navigates to `/messages`

### Edge Cases & Errors
- [ ] Empty message = send button disabled
- [ ] Send while already sending = `isSending` prevents duplicate
- [ ] Enter key sends message (without Shift)
- [ ] Shift+Enter = new line in message
- [ ] Sender is string ID (not populated) = fallback to participant lookup (L433-448)
- [ ] Sender is ObjectId-like object = `.toString()` fallback
- [ ] No messages in conversation = "No messages here yet" empty state
- [ ] `conversationId` is undefined = socket calls with `undefined` (potential crash)
- [ ] Typing timeout cleanup on unmount = no memory leak
- [ ] `typingTimeout` in useEffect dependency array = potential infinite loop (L156)
- [ ] Socket disconnected = messages sent via API still work, but no real-time updates

---

## 12. User Profile (`UserProfile.tsx`)

### Happy Paths
- [ ] Page loads = user data displayed (name, email, avatar, bio, preferences)
- [ ] Profile completeness bar calculated from filled fields
- [ ] Verification badges (email, phone, ID) shown with correct status
- [ ] "Edit Profile" button = navigates to `/profile/edit`
- [ ] "Boost Profile" button shown if not boosted

### Edge Cases & Errors
- [ ] Unauthenticated user = redirected to `/login`
- [ ] Authenticated but user data not loaded = `loadUser()` dispatched
- [ ] Loading state = CircularProgress shown
- [ ] Error loading profile = error message displayed
- [ ] User is null after load = "No profile data available"
- [ ] Avatar missing = first letter of name shown as fallback
- [ ] Optional fields (phone, location, bio, age, occupation) = conditionally rendered

---

## 13. Edit Profile (`EditProfile.tsx`)

### Happy Paths
- [ ] Form pre-populated with current user data
- [ ] Upload profile image = preview shown
- [ ] Update name, phone, location, bio, age, occupation, university, budget
- [ ] Select lifestyle preferences (multi-select)
- [ ] Select interests (multi-select)
- [ ] Save = `updateProfile()` dispatched, success alert, redirect to `/profile` after 2s

### Edge Cases & Errors
- [ ] First name empty = validation error
- [ ] Last name empty = validation error
- [ ] Invalid email = validation error
- [ ] Age < 18 = "Must be at least 18"
- [ ] Age > 100 = "Invalid age"
- [ ] Bio > 500 chars = validation error
- [ ] Budget max < budget min = "Max budget must be greater than min budget"
- [ ] Upload non-image file = `console.error("Invalid file type")`
- [ ] Cancel button = navigates back to `/profile`
- [ ] Name split: `name.split(' ')[0]` for firstName, rest for lastName
- [ ] Profile update fails = error logged, error alert from Redux
- [ ] `enableReinitialize` = form updates when user data reloads

---

## 14. Roommates Search (`GET /api/roommates`)

- [ ] Search roommates = returns list of users with `isRoommateListed: true`
- [ ] Filter by budget (maxBudget) = users within budget range
- [ ] Filter by location = matching preferences
- [ ] Search text = matches user names/bios
- [ ] Coordinates passed = location-based results
- [ ] No results = empty state

---

## 15. Socket.io Real-Time (`socketService.ts`, `backend/services/socket.ts`)

### Happy Paths
- [ ] Socket connects on login with token from localStorage
- [ ] `joinConversation(id)` = joins socket room
- [ ] `leaveConversation(id)` = leaves socket room
- [ ] `sendMessage` event = message delivered to room participants
- [ ] `newMessage` event = Redux store updated, unread count incremented
- [ ] `messagesRead` event = read receipts updated
- [ ] `typing` / `stopTyping` events = indicator shown/hidden
- [ ] `markMessagesAsRead(conversationId)` = emits read event

### Edge Cases & Errors
- [ ] Token missing in localStorage = socket init fails gracefully
- [ ] Token expired = socket auth fails, reconnect attempted
- [ ] Socket disconnects = auto-reconnect behavior
- [ ] Server restarts = client reconnects, re-joins rooms
- [ ] Multiple tabs = multiple socket connections (potential duplicate messages)
- [ ] Socket event with malformed data = error caught, no crash
- [ ] Offline user receives message = unread count incremented in DB

---

## 16. Navigation & Routing (`App.tsx`, `PrivateRoute.tsx`)

- [ ] `/` = Home page (public)
- [ ] `/login` = Login page (public)
- [ ] `/register` = Register page (public)
- [ ] `/forgot-password` = Password reset page (public)
- [ ] `/properties` = Property listing (public)
- [ ] `/properties/:id` = Property detail (public)
- [ ] `/properties/create` = Create property (private, requires auth)
- [ ] `/properties/edit/:id` = Edit property (private)
- [ ] `/dashboard` = Dashboard (private)
- [ ] `/messages` = Conversation list (private)
- [ ] `/messages/:id` = Conversation (private)
- [ ] `/profile` = User profile (private)
- [ ] `/profile/edit` = Edit profile (private)
- [ ] `/roommates` = Roommate search (public)
- [ ] PrivateRoute: unauthenticated = redirect to `/login`
- [ ] PrivateRoute: loading state = full-screen spinner
- [ ] Invalid route = handled (no blank page)
- [ ] Lazy loading (React.lazy + Suspense) = loading fallback shown
- [ ] Direct URL access to private route = redirect then restore after login
- [ ] Browser back/forward navigation = correct page rendered

---

## 17. API Service & Error Handling (`api.ts`)

- [ ] Base URL set from `REACT_APP_API_URL` environment variable
- [ ] Request interceptor adds `Authorization: Bearer <token>` header
- [ ] 401 response = token removed, redirected to `/login`
- [ ] 500 response = error propagated to Redux slice
- [ ] Network timeout = error caught and displayed
- [ ] CORS error = blocked by backend allowedOrigins list
- [ ] Request with `FormData` = `Content-Type` not overridden (browser sets multipart boundary)

---

## 18. Backend — CORS & Security (`server.ts`)

- [ ] Allowed origins: `flatmates.co.in`, `www.flatmates.co.in`, Vercel URL, `localhost:3000`, `CLIENT_URL`
- [ ] Unknown origin = CORS blocked with error message
- [ ] No origin (server-to-server) = allowed (`!origin` returns true)
- [ ] Preflight OPTIONS request = handled by `app.options('*', cors())`
- [ ] Request body parsing = `express.json()` and `urlencoded` middleware
- [ ] Static files served from `/uploads` directory
- [ ] Activity tracking middleware = updates `lastActive` on authenticated requests
- [ ] Activity tracking fails = error logged, request continues (doesn't block)
- [ ] Global error handler = 500 with message and error detail
- [ ] Production mode = serves React build from `../frontend/build`
- [ ] MongoDB connection fails = error logged (server still starts)
- [ ] JWT secret fallback = `'your_jwt_secret'` (SECURITY RISK in production)

---

## 19. Backend — Background Jobs (`server.ts`)

- [ ] Properties older than 30 days auto-marked as `inactive`
- [ ] Job runs at startup and every 24 hours
- [ ] Only `active` properties are affected
- [ ] Job error = logged, doesn't crash server
- [ ] Modified count logged when properties are updated

---

## 20. Backend — Property Routes

- [ ] Create property with images = Cloudinary upload, URLs stored
- [ ] Create property without images = property created with empty images array
- [ ] Update property: add new images = appended to existing
- [ ] Update property: remove images = filtered by URL
- [ ] Update property: non-owner = 401 "Not authorized"
- [ ] Delete property: non-owner = 401
- [ ] Delete property: invalid ID = 404
- [ ] Save property toggle = adds/removes from `user.savedProperties`
- [ ] Save property: already saved = unsaves
- [ ] Save property: property not found = 404
- [ ] Email notification to owner on property view (authenticated, non-self)
- [ ] Email notification to owner on property save
- [ ] Match notification to users when new property matches preferences
- [ ] `parseFormDataJSON` handles string JSON and plain objects

---

## 21. Backend — Message Routes

- [ ] Create conversation = checks for blocked users
- [ ] Create conversation with self = 400 "You cannot message yourself"
- [ ] Existing conversation found = returns it (reactivates if archived)
- [ ] Initial message provided = message created, notification added
- [ ] Send message = unread count incremented for other participants
- [ ] Send message to blocked user = 403 "Communication blocked"
- [ ] Non-participant sends message = 401 "Not authorized"
- [ ] Response time tracking = weighted average calculated
- [ ] Email notification sent to recipient on new message
- [ ] Archive conversation = soft delete (isActive = false)
- [ ] Share contact = system message created, `contactSharedBy` updated
- [ ] Messages sorted by `createdAt: 1` (chronological)
- [ ] Read receipts: messages marked as read when conversation opened

---

## 22. Offline / No Internet Behavior

- [ ] App loads with cached data = previously loaded properties shown
- [ ] API call with no internet = error caught, user-friendly message
- [ ] Socket disconnects offline = reconnects when online
- [ ] Form submission offline = error shown, data not lost
- [ ] Geolocation works offline (GPS) but reverse geocoding fails = handled
- [ ] Token in localStorage survives offline = user stays "logged in" locally
- [ ] Nominatim/Pincode API calls fail offline = errors caught gracefully

---

## 23. Performance Checkpoints

- [ ] Lazy loading: pages loaded on-demand via `React.lazy()` = smaller initial bundle
- [ ] Image uploads: max 5MB per image, max 5 images = prevents memory issues
- [ ] Property list pagination: default 10 per page = prevents loading entire DB
- [ ] Skeleton loaders shown during data fetch = perceived performance
- [ ] Dashboard fetches listings + conversations in parallel via `useEffect`
- [ ] MongoDB text index on `title` and `description` = faster search queries
- [ ] Background job uses `updateMany` = efficient batch update
- [ ] Socket events are targeted to rooms = no broadcast to all users
- [ ] Cloudinary image hosting = CDN delivery, not self-hosted
- [ ] Email notifications use `setImmediate()` = non-blocking, fire-and-forget
- [ ] `multer` memory storage for properties = no disk I/O before Cloudinary upload
- [ ] Property list sorting by `isFeatured` then `createdAt` = featured first

---

## 24. Platform-Specific Behavior

### Mobile / Responsive
- [ ] Home search: toggle buttons stack vertically on xs screens
- [ ] Search inputs stack vertically on mobile (`direction={{ xs: "column", md: "row" }}`)
- [ ] Category cards: full width on mobile, 3 columns on desktop
- [ ] Dashboard: single column on mobile, two columns on desktop
- [ ] Conversation view: full height `calc(100vh - 180px)` = no overflow issues on mobile
- [ ] Bottom spacer (100px) on PropertyDetail for mobile bottom nav
- [ ] Budget slider touch interaction = works on mobile
- [ ] File input for image upload = opens camera/gallery on mobile

### Browser-Specific
- [ ] `navigator.geolocation` not available in older browsers = graceful degradation
- [ ] `navigator.clipboard.writeText` = may fail in non-HTTPS contexts
- [ ] `FileReader.readAsDataURL` = image preview generation works cross-browser
- [ ] `window.confirm()` for delete/block = native dialogs render correctly

---

## 25. Data Integrity & Security

- [ ] Passwords hashed with bcrypt (salt rounds: 10) = not stored in plain text
- [ ] Password excluded from user queries (`select('-password')`)
- [ ] Frontend encrypts passwords with AES before transmission
- [ ] Backend decrypts passwords before bcrypt comparison
- [ ] JWT signed with `JWT_SECRET` env var = tokens can't be forged
- [ ] JWT expires in 7 days = limits damage from token theft
- [ ] File upload validation: type + size on both frontend and backend
- [ ] Property ownership checked before edit/delete
- [ ] Conversation membership checked before read/send
- [ ] Blocked users can't send messages (checked on create AND send)
- [ ] `cleanAxios` instance used for external APIs = auth headers not leaked

---

## 26. Known Bugs & Risks Found During Audit

- [ ] **BUG**: `resetPassword.pending` sets `loading: false` (should be `true`) — `passwordResetSlice.ts` L119
- [ ] **RISK**: JWT secret fallback `'your_jwt_secret'` used if env var missing — `auth.ts`
- [ ] **RISK**: Encryption key fallback `flatmates_secure_key_123` hardcoded — `security.ts`
- [ ] **RISK**: No rate limiting on auth endpoints = brute force possible
- [ ] **RISK**: `console.log(budget)` left in production code — `Home.tsx`
- [ ] **RISK**: Backend logs full request body for property creation — `properties.ts` L185
- [ ] **RISK**: `passwordResetSlice` uses raw `axios` instead of configured API instance = no interceptors
- [ ] **RISK**: Duplicate `valueLabelFormat` condition (both check `>= 10000000`) — `EnhancedFilters.tsx`
- [ ] **RISK**: `typingTimeout` in useEffect dependency array may cause re-render loops — `Conversation.tsx`
- [ ] **RISK**: No CSRF protection implemented
- [ ] **RISK**: Error stack exposed in property list API response (L422) = info leakage
