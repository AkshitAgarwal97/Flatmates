# Flatmates — Complete Codebase Documentation

> **Purpose of this file**: This document describes the *entire* Flatmates codebase in enough detail that any AI assistant (or new developer) can understand the project, its architecture, data models, API surface, frontend state management, services, deployment topology, and coding conventions — **without reading every source file**.

---

## 1. Project Overview

**Flatmates** is a full-stack **roommate & rental property marketplace** web application. It lets users:

- **Register / Login** (email + password; social login placeholders for Google/Facebook/Instagram).
- **List properties** (rooms, flats, apartments) with images uploaded to **Cloudinary**.
- **Search & filter** properties by city, price, property type, amenities, gender preference, occupation, lifestyle, radius (geo), and text search.
- **Browse roommate profiles** — users can opt-in to list themselves as roommates with lifestyle/budget/preference data.
- **Real-time messaging** between users via **Socket.IO**, with typing indicators, read receipts, file attachments, and contact sharing.
- **Save/unsave** properties, get **match scores** based on preference compatibility, and receive **email + in-app notifications**.
- **Report/block** other users.
- **Discover services** (movers, cleaners, furniture rental, internet providers) in a marketplace.
- **i18n** — supports English and Hinglish (Hindi-English) via `react-i18next`.

**Live domain**: `flatmates.co.in` (API at `api.flatmates.co.in`).

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        NGINX Gateway                      │
│   (SSL termination, reverse-proxy to frontend & backend)  │
│   Ports: 80/443 → frontend:80 | /api → backend:5000      │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────┐       ┌──────────────────────────┐  │
│  │   React Frontend │       │   Express.js Backend     │  │
│  │  (CRA, port 3000)│       │   (Node.js, port 5000)   │  │
│  │  MUI + Redux     │◀─────▶│   REST + Socket.IO       │  │
│  │  Toolkit + Axios │       │   Passport JWT Auth       │  │
│  │  + Socket.IO CLI │       │   Mongoose ODM            │  │
│  └──────────────────┘       └──────────┬───────────────┘  │
│                                         │                  │
│              ┌──────────────────────────┼──────────┐       │
│              │        MongoDB           │          │       │
│              │  (Atlas / local:27017)   │          │       │
│              └──────────────────────────┘          │       │
│                                                    │       │
│              ┌─────────────┐   ┌───────────────┐   │       │
│              │  Cloudinary  │   │  SMTP (Email) │   │       │
│              │  (images)    │   │  (Nodemailer) │   │       │
│              └─────────────┘   └───────────────┘   │       │
└──────────────────────────────────────────────────────────┘
```

| Layer | Tech | Notes |
|---|---|---|
| Frontend | React 18, TypeScript, MUI 5, Redux Toolkit, Axios, Socket.IO Client, Leaflet, Formik + Yup, react-i18next | CRA (Create React App), lazy-loaded pages |
| Backend | Node.js, Express 4, TypeScript, Mongoose 7, Passport JWT, Socket.IO 4, Multer, Cloudinary SDK, Nodemailer | Single `server.ts` entry point |
| Database | MongoDB (via Mongoose) | 7 collections |
| File Storage | Cloudinary (property images), Local disk (avatars, message attachments) | |
| Deployment | Docker Compose (3 services: backend, frontend, nginx-gateway) | Also has Vercel config & AWS deploy script |
| Testing | Jest (unit), Playwright (E2E), custom smoke scripts | |

---

## 3. Repository Structure

```
Flatmates/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── server.ts           # ★ ENTRY POINT — Express app, Socket.IO, MongoDB connection, background jobs
│   │   ├── config/
│   │   │   ├── passport.ts     # JWT strategy configuration for Passport.js
│   │   │   └── cloudinary.ts   # Cloudinary SDK initialization (env-based)
│   │   ├── controllers/        # Route handler business logic
│   │   │   ├── authController.ts       # register, login, getUser, completeProfile, forgotPassword, verifyOtp, resetPassword
│   │   │   ├── propertyController.ts   # CRUD properties, search/filter, save/unsave, match scoring
│   │   │   ├── messageController.ts    # conversations CRUD, send message, archive, share contact
│   │   │   ├── userController.ts       # profile CRUD, notifications, verify, block, report
│   │   │   ├── roommateController.ts   # search roommates with filters
│   │   │   └── serviceController.ts    # list & create marketplace services
│   │   ├── middleware/
│   │   │   ├── auth.ts         # `protect` middleware — wraps passport.authenticate('jwt')
│   │   │   └── validate.ts     # Generic express-validator middleware runner
│   │   ├── models/             # Mongoose schemas + TypeScript interfaces
│   │   │   ├── User.ts         # Users with preferences, notifications, roommate fields, verification flags
│   │   │   ├── Property.ts     # Property listings with address, price, features, preferences, images
│   │   │   ├── Conversation.ts # Chat conversations (participants, unreadCount map, contactSharedBy)
│   │   │   ├── Message.ts      # Individual messages (text/image/system) with read receipts
│   │   │   ├── OTP.ts          # One-time passwords for password reset (auto-expire 10 min TTL)
│   │   │   ├── Report.ts       # User/property reports with status lifecycle
│   │   │   └── Service.ts      # Marketplace services (movers, cleaning, etc.)
│   │   ├── routes/             # Express routers — validation rules + middleware binding
│   │   │   ├── auth.ts         # /api/auth/*
│   │   │   ├── properties.ts   # /api/properties/*
│   │   │   ├── messages.ts     # /api/messages/*
│   │   │   ├── users.ts        # /api/users/*
│   │   │   ├── roommates.ts    # /api/roommates/*
│   │   │   └── services.ts     # /api/services/*
│   │   ├── services/           # Business logic services (decoupled from controllers)
│   │   │   ├── socket.ts       # Socket.IO handler — auth, join/leave rooms, send-message, typing, read receipts
│   │   │   ├── emailService.ts # Nodemailer-based email: welcome, OTP, message notifications, property view/save
│   │   │   ├── messageService.ts       # Core messaging logic: send, track response time, notify
│   │   │   ├── notificationService.ts  # In-app notification: persist to DB + emit via Socket.IO
│   │   │   └── uploadService.ts        # Multer configs (avatar/property/message) + Cloudinary upload/delete
│   │   ├── types/
│   │   │   └── express.ts      # AuthenticatedRequest, JWTPayload, wrapHandler utility
│   │   └── utils/
│   │       ├── apiResponse.ts  # Standardized { success, data } / { success, message } / { success, errors } helpers
│   │       ├── cache.ts        # In-memory TTL cache (SimpleCache) for property listing GET responses
│   │       ├── matchScore.ts   # Weighted scoring: budget(25), gender(25), lifestyle(30), roomType(20)
│   │       ├── formDataHelper.ts       # Safe JSON.parse for FormData nested objects
│   │       ├── security.ts     # Security utilities
│   │       └── uploadSecurity.ts       # Upload security utilities
│   ├── scripts/
│   │   ├── seedRoommates.ts    # Seed script — generates fake roommate users in MongoDB
│   │   ├── cleanupMessages.ts  # Cleanup script — removes orphan messages/conversations
│   │   ├── e2e-smoke.js        # Smoke test script (HTTP API verification)
│   │   └── test-phase1-security.* # Security audit scripts
│   ├── package.json            # Backend deps: express, mongoose, socket.io, passport-jwt, bcryptjs, cloudinary, multer, nodemailer
│   ├── tsconfig.json
│   └── Dockerfile              # Node.js container
│
├── frontend/                   # React SPA (Create React App)
│   ├── src/
│   │   ├── App.tsx             # ★ ROOT COMPONENT — Theme, Router, lazy page imports, Suspense
│   │   ├── index.tsx           # ReactDOM.render with Redux Provider
│   │   ├── i18n.ts             # i18next initialization (en, hi-en)
│   │   ├── config/             # Frontend config
│   │   ├── redux/
│   │   │   ├── store.ts        # Redux Toolkit store: auth + property + message + alert + passwordReset slices
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.ts          # Auth state: loadUser, register, login, completeProfile, updateProfile, toggleSaveProperty
│   │   │   │   ├── propertySlice.ts      # Property state: getProperties, getPropertyById, createProperty, updateProperty, deleteProperty, save/unsave, getUserListings
│   │   │   │   ├── messageSlice.ts       # Message state: fetchConversations, createConversation, fetchMessages, sendMessage, archiveConversation, receiveMessage (socket)
│   │   │   │   ├── passwordResetSlice.ts # Password reset wizard: sendOTP → verifyOTP → resetPassword (3-step flow)
│   │   │   │   └── alertSlice.ts         # Toast alerts (success/error/warning/info) with auto-removal
│   │   │   └── selectors/      # Memoized selectors (directory exists)
│   │   ├── services/
│   │   │   ├── api.ts          # ★ CRITICAL — Axios instance, request/response interceptors, all API call functions (authAPI, propertyAPI, userAPI, messageAPI, serviceAPI)
│   │   │   └── socketService.ts # Socket.IO client: init, join/leave conversation, emit messages, typing, read receipts
│   │   ├── types/
│   │   │   ├── index.ts        # All shared TypeScript interfaces: User, Property, Message, Conversation, Pagination, PropertyFilters, form types, state types
│   │   │   └── roommate.ts     # Roommate-specific types
│   │   ├── hooks/
│   │   │   └── usePageTitle.ts # Custom hook for document title
│   │   ├── utils/
│   │   │   ├── imageOptimization.ts # Image resizing/compression utilities
│   │   │   └── security.ts    # Frontend security utilities
│   │   ├── locales/
│   │   │   ├── en.json         # English translations
│   │   │   └── hi-en.json      # Hinglish translations
│   │   ├── pages/              # Page-level components (all lazy-loaded)
│   │   │   ├── Home.tsx                    # Landing page
│   │   │   ├── Dashboard.tsx               # User dashboard
│   │   │   ├── Notifications.tsx           # Notifications list
│   │   │   ├── Roommates.tsx               # Roommate search page (wrapper)
│   │   │   ├── NotFound.tsx                # 404 page
│   │   │   ├── PrivacyPolicy.tsx           # Privacy policy
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx               # Login form with email/password
│   │   │   │   ├── Register.tsx            # Registration form
│   │   │   │   ├── ForgotPassword.tsx      # 3-step forgot password (OTP-based)
│   │   │   │   ├── AuthSuccess.tsx         # OAuth callback handler
│   │   │   │   ├── Onboarding.tsx          # Post-registration onboarding wizard
│   │   │   │   └── CompleteProfile.tsx     # Profile completion after social login
│   │   │   ├── property/
│   │   │   │   ├── PropertyListing.tsx     # Main property browse page with map + filters
│   │   │   │   ├── PropertyDetail.tsx      # Single property detail page (23KB — heavy)
│   │   │   │   ├── PropertyForm.tsx        # Create/Edit property form (42KB — the largest file)
│   │   │   │   ├── PropertyList.tsx        # Property list grid component
│   │   │   │   ├── CreateProperty.tsx      # Wrapper for PropertyForm (create mode)
│   │   │   │   ├── EditProperty.tsx        # Wrapper for PropertyForm (edit mode)
│   │   │   │   ├── MyListings.tsx          # User's own property listings management
│   │   │   │   ├── SavedProperties.tsx     # User's saved/bookmarked properties
│   │   │   │   └── CityLandingPage.tsx     # SEO landing page for specific cities (/flats-in-:citySlug)
│   │   │   ├── messages/
│   │   │   │   ├── Messages.tsx            # Messages root (split-pane layout)
│   │   │   │   ├── ConversationList.tsx    # Sidebar conversation list
│   │   │   │   ├── Conversation.tsx        # Active conversation view (chat UI)
│   │   │   │   └── NewConversation.tsx     # Start new conversation dialog
│   │   │   ├── user/
│   │   │   │   ├── UserProfile.tsx         # Own profile view
│   │   │   │   ├── EditProfile.tsx         # Profile edit form
│   │   │   │   └── PublicProfile.tsx       # View another user's profile
│   │   │   └── marketplace/
│   │   │       └── ServiceMarketplace.tsx  # Services marketplace page
│   │   └── components/         # Reusable components
│   │       ├── layout/
│   │       │   ├── Header.tsx              # App header / navigation bar
│   │       │   ├── Footer.tsx              # App footer
│   │       │   ├── Layout.tsx              # Full layout wrapper
│   │       │   ├── MobileBottomNav.tsx     # Mobile bottom navigation bar
│   │       │   └── LanguageSwitcher.tsx    # Language toggle (en ↔ hi-en)
│   │       ├── property/
│   │       │   ├── PropertyCard.tsx        # Property card for listing grids
│   │       │   ├── EnhancedFilters.tsx     # Advanced property filter panel (18KB)
│   │       │   └── PropertyImageGallery.tsx # Image carousel/gallery
│   │       ├── roommates/
│   │       │   ├── RoommateCard.tsx        # Individual roommate card
│   │       │   ├── RoommatesList.tsx       # Roommate search results list
│   │       │   ├── RoommatesFilter.tsx     # Roommate search filter controls
│   │       │   ├── RoommatesMap.tsx        # Roommate map view (Leaflet)
│   │       │   └── mockData.ts            # Mock roommate data for development
│   │       ├── marketplace/
│   │       │   └── ServiceCard.tsx         # Marketplace service card
│   │       ├── ui/
│   │       │   ├── Alert.tsx               # Toast alert component
│   │       │   ├── AuthPromptDialog.tsx    # "Login required" dialog
│   │       │   ├── Breadcrumbs.tsx         # URL-based breadcrumb navigation
│   │       │   ├── CookieConsent.tsx       # Cookie consent banner
│   │       │   ├── MessageNotification.tsx # Real-time message notification popup
│   │       │   ├── NotificationCenter.tsx  # Notification center dropdown
│   │       │   └── PropertyMap.tsx         # Single property map (Leaflet)
│   │       ├── routing/
│   │       │   └── PrivateRoute.tsx        # Auth guard — redirects to /login if not authenticated
│   │       └── common/
│   │           └── ReportDialog.tsx        # Report user/property dialog
│   ├── package.json            # Frontend deps: react, mui, redux-toolkit, axios, socket.io-client, leaflet, formik, yup, i18next
│   ├── tsconfig.json
│   ├── nginx.conf              # Nginx config for serving React build
│   └── Dockerfile              # Multi-stage: build React → serve via Nginx
│
├── nginx-gateway/
│   └── nginx.conf              # Reverse proxy: frontend (port 80), backend (/api → port 5000), SSL
│
├── docs/                       # Additional documentation
├── team/                       # Team role documentation (CEO, Dev, Tester, Deployment, SEO)
├── tests/                      # E2E test specs (Playwright)
│   ├── e2e_test.js             # Core E2E smoke test
│   ├── mobile_e2e.spec.ts      # Mobile-specific E2E
│   ├── roommates_e2e.spec.ts   # Roommate feature E2E
│   ├── scaling_e2e.spec.ts     # Performance/scaling E2E
│   └── trust_e2e.spec.ts       # Trust/safety feature E2E
│
├── docker-compose.yml          # Production: backend + frontend + nginx-gateway
├── docker-compose.simple.yml   # Simplified Docker setup
├── vercel.json                 # Vercel deployment config (frontend)
├── render.yaml                 # Render.com deployment config
├── playwright.config.ts        # Playwright E2E test config
├── deploy_to_aws.ps1           # PowerShell script for AWS EC2 deployment
├── setup_server.sh             # Server setup script (Ubuntu)
├── setup_swap.sh               # Swap file setup for low-memory servers
├── .env                        # Root environment variables
├── .env.production             # Production env overrides
└── package.json                # Root monorepo scripts (start, build delegate to frontend)
```

---

## 4. Data Models (MongoDB Collections)

### 4.1 User (`users`)
| Field | Type | Notes |
|---|---|---|
| `name` | String (required) | |
| `email` | String (required, unique) | |
| `password` | String (optional) | bcrypt-hashed; optional for social login |
| `avatar` | String | URL to avatar image |
| `socialProvider` | Enum: `local`, `google`, `facebook`, `instagram` | |
| `socialId` | String | Third-party OAuth ID |
| `phone` | String | Hidden from other users unless contact is mutually shared |
| `bio` | String | |
| `needsProfileCompletion` | Boolean (default: true) | Cleared after completing onboarding |
| `preferences` | Object: `{ location[], budget{min,max}, moveInDate, duration, roomType, amenities[], gender, ageRange{min,max}, lifestyle[] }` | Used for match scoring |
| `savedProperties` | ObjectId[] → Property | |
| `blockedUsers` | ObjectId[] → User | |
| `notifications` | Embedded array: `{ type, content, relatedTo, read, createdAt }` | Capped at 100 most recent |
| `isEmailVerified`, `isPhoneVerified`, `isIdVerified` | Boolean | Trust badges |
| `lastActive` | Date | Updated every 5 minutes (debounced middleware) |
| `averageResponseTime` | Number | Minutes — rolling average of chat reply time |
| `isBoosted`, `boostedUntil` | Boolean / Date | Premium visibility feature |
| `gender` | Enum: `Male`, `Female`, `Other` | Roommate field |
| `dob` | Date | Roommate field — age calculated dynamically |
| `occupation` | Enum: `Student`, `Professional`, `WFH`, `Other` | |
| `personalLifestyle` | Object: `{ food, smoking, drinking, cleanliness }` | Roommate preferences |
| `isRoommateListed` | Boolean (default: false) | Whether user appears in roommate search |

**Indexes**: `{socialProvider, socialId}`, `{isRoommateListed, lastActive}`, `{isBoosted, boostedUntil}`

### 4.2 Property (`properties`)
| Field | Type | Notes |
|---|---|---|
| `owner` | ObjectId → User (required) | |
| `title` | String (required) | |
| `description` | String (required) | |
| `propertyType` | Enum: `room`, `flat`, `house`, `studio`, `apartment` | |
| `listingType` | Enum: `room_in_flat`, `roommates_for_flat`, `occupied_flat`, `entire_property` | |
| `address` | Object: `{ street, city (req), state, country (req), zipCode, coordinates{lat,lng} }` | |
| `price` | Object: `{ amount (req), brokerage }` | Amount is monthly rent |
| `availability` | Object: `{ availableFrom (req), availableUntil, minimumStay, maximumStay }` | |
| `features` | Object: `{ bedrooms, bathrooms, area, furnishing, amenities[], utilities[] }` | |
| `images` | Array: `[{ url (req), caption }]` | Cloudinary URLs |
| `currentOccupants` | Object: `{ total, details[{gender, age, occupation}] }` | |
| `preferences` | Object: `{ gender, ageRange, occupation[], lifestyle[], smoking, pets }` | Tenant preferences |
| `status` | Enum: `active`, `inactive`, `rented` (default: `active`) | Auto-set to `inactive` after 30 days |
| `views`, `saves` | Number | Engagement counters |
| `isFeatured`, `featuredUntil` | Boolean / Date | Premium placement |

**Indexes**: Text index on `{title, description}`, Compound: `{city, status, price}`, `{status, createdAt}`, `{owner, status, createdAt}`, `{isFeatured, status, featuredUntil}`, `{price, status}`, `{preferences.gender, status}`

### 4.3 Conversation (`conversations`)
| Field | Type | Notes |
|---|---|---|
| `participants` | ObjectId[] → User (required) | Always 2 users |
| `property` | ObjectId → Property | Optional — context for the conversation |
| `lastMessage` | ObjectId → Message | |
| `unreadCount` | Map<string, Number> | Per-participant unread count |
| `isActive` | Boolean (default: true) | Soft delete via archiving |
| `contactSharedBy` | ObjectId[] → User | Which participants shared contact details |

### 4.4 Message (`messages`)
| Field | Type | Notes |
|---|---|---|
| `conversation` | ObjectId → Conversation (required) | |
| `sender` | ObjectId → User (required) | |
| `content` | String (required) | |
| `type` | Enum: `text`, `image`, `system` | System messages for events like contact sharing |
| `attachments` | Array: `[{type, url, fileType}]` | |
| `read` | Boolean (default: false) | |
| `readAt` | Date | |
| `createdAt` | Date | |

### 4.5 OTP (`otps`)
| Field | Type | Notes |
|---|---|---|
| `email` | String (required, lowercase, trimmed) | |
| `otp` | String (required) | 6-digit code |
| `createdAt` | Date | TTL index — auto-deleted after 600 seconds (10 minutes) |

### 4.6 Report (`reports`)
| Field | Type | Notes |
|---|---|---|
| `reporter` | ObjectId → User | |
| `targetUser` | ObjectId → User (optional) | |
| `targetProperty` | ObjectId → Property (optional) | |
| `reason` | Enum: `spam`, `harassment`, `fraud`, `inappropriate_content`, `other` | |
| `description` | String | |
| `status` | Enum: `pending`, `reviewed`, `resolved`, `dismissed` | |

### 4.7 Service (`services`)
| Field | Type | Notes |
|---|---|---|
| `name` | String (required) | |
| `type` | Enum: `movers`, `cleaning`, `furniture_rental`, `internet`, `other` | |
| `description` | String (required) | |
| `priceRange` | String | |
| `contactInfo` | Object: `{ phone, email, website }` | |
| `rating` | Number (default: 0) | |
| `logo` | String | |
| `isPromoted` | Boolean | |
| `city` | String[] | |

---

## 5. API Routes Reference

### 5.1 Authentication — `/api/auth`
> Rate limited: 20 requests per 15 minutes per IP

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Register with name, email, password (min 6 chars). Returns JWT + user object. Sends welcome email. |
| POST | `/login` | Public | Login with email + password. Returns JWT + user object. |
| GET | `/user` | Private | Get current authenticated user (excludes password). |
| PUT | `/complete-profile` | Private | Complete profile after registration (phone, bio, preferences). Sets `needsProfileCompletion = false`. |
| POST | `/forgot-password` | Public | Send 6-digit OTP to email for password reset. |
| POST | `/verify-otp` | Public | Verify OTP code (email + otp). |
| POST | `/reset-password` | Public | Reset password with email + otp + new password. |

### 5.2 Properties — `/api/properties`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List properties with filters. Supports: `listingType`, `propertyType`, `city`, `country`, `minPrice`, `maxPrice`, `availableFrom`, `bedrooms`, `bathrooms`, `furnishing`, `amenities`, `gender`, `occupation`, `lifestyle`, `search` (full-text), `street`, `state`, `zipCode`, `petFriendly`, `lat`+`lng`+`radius` (geo), `page`, `limit`. Cached for 60s (non-authenticated). Authenticated users get `matchScore` per property. |
| POST | `/` | Private | Create property. Multipart form data with up to 10 images. Validates title, description, propertyType, listingType, address (city+country), price (amount), availability (availableFrom). Notifies matching users in background. Busts listing cache. |
| GET | `/user/saved` | Private | Get current user's saved properties. |
| GET | `/user/listings` | Private | Get current user's own listings. |
| GET | `/:id` | Public | Get single property by ID. Increments view count. Sends email notification to owner (if viewer is different). |
| PUT | `/:id` | Private | Update property (owner only). Supports adding new images and removing existing ones via `removeImages` (comma-separated URLs). |
| DELETE | `/:id` | Private | Delete property (owner only). |
| POST | `/:id/save` | Private | Toggle save/unsave property. Sends email to property owner. Returns updated `savedProperties` array. |

### 5.3 Messages — `/api/messages`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/conversations` | Private | Get all active conversations for current user. Populated with participants, property, lastMessage. |
| POST | `/conversations` | Private | Create conversation with `recipient` (userId), optional `property`, optional `initialMessage`. Checks block status. Returns existing conversation if one already exists. |
| GET | `/conversations/:id` | Private | Get all messages in a conversation. Marks unread messages as read. Resets unread count. |
| POST | `/conversations/:id` | Private | Send message (content required). Supports file attachments (up to 5). Updates response time tracking. Sends email + in-app notification. |
| DELETE | `/conversations/:id` | Private | Archive conversation (soft delete — sets `isActive = false`). |
| POST | `/conversations/:id/share-contact` | Private | Share contact details. Creates system message. When both participants share, enables phone number visibility. |

### 5.4 Users — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/me` | Private | Get current user profile. |
| PUT | `/me` | Private | Update profile (name, email, phone, bio, preferences, avatar file upload). |
| GET | `/:id` | Public | Get user by ID. Phone number hidden unless mutual contact sharing exists. |
| GET | `/` | Public | List users with filters: `city`, `search`, `page`, `limit`. |
| GET | `/me/notifications` | Private | Get user's notifications array. |
| PUT | `/notifications/:id` | Private | Mark single notification as read. |
| POST | `/verify/:type` | Private | Verify user attribute (email, phone, or id). Placeholder — no real verification flow yet. |
| POST | `/block/:userId` | Private | Toggle block/unblock a user. |
| POST | `/report` | Private | Report a user or property. Requires `reason` (enum). |

### 5.5 Roommates — `/api/roommates`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Search roommates (users where `isRoommateListed = true`). Filters: `minBudget`, `maxBudget`, `gender`, `food`, `occupation`, `search` (location), `sort` (recommended/newest/budget_low/budget_high), `page`, `limit`. Returns transformed data with calculated age, active status, compatibility score (currently random 80-100). |

### 5.6 Services — `/api/services`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List services, optional filter by `city` and `type`. Sorted by promoted first, then rating. |
| POST | `/` | Private | Create a service (name, type, description required). Sanitized against mass assignment. |

---

## 6. Real-Time (Socket.IO)

### Connection
- Clients connect with JWT token in `socket.handshake.auth.token`
- Server verifies token via `jwt.verify` middleware
- Each user joins a room with their own `userId` for private notifications

### Events

| Direction | Event | Payload | Description |
|---|---|---|---|
| Client → Server | `join-conversation` | `conversationId` | Join a conversation room (after authorization check) |
| Client → Server | `leave-conversation` | `conversationId` | Leave a conversation room |
| Client → Server | `send-message` | `{ conversationId, content, attachments? }` | Send message (persisted via `messageService`, emitted to room) |
| Client → Server | `typing` | `conversationId` | Typing indicator start |
| Client → Server | `stop-typing` | `conversationId` | Typing indicator stop |
| Client → Server | `mark-read` | `conversationId` | Mark all messages in conversation as read |
| Server → Client | `new-message` | Message object | New message in joined conversation |
| Server → Client | `message-notification` | `{ conversationId, message }` | Notification for message in non-joined conversation |
| Server → Client | `user-typing` | `{ userId, conversationId }` | Other user started typing |
| Server → Client | `user-stop-typing` | `{ userId, conversationId }` | Other user stopped typing |
| Server → Client | `messages-read` | `{ userId, conversationId }` | Read receipt from other user |
| Server → Client | `notification` | Notification object | In-app notification (match, system, etc.) |

---

## 7. Frontend State Management (Redux Toolkit)

### Store Slices

| Slice | Key State | Async Thunks |
|---|---|---|
| `auth` | `{ user, token, isAuthenticated, loading, error }` | `loadUser`, `register`, `login`, `completeProfile`, `updateProfile`, `toggleSaveProperty` |
| `property` | `{ properties[], property, savedProperties[], userListings[], loading, error, pagination }` | `getProperties`, `getPropertyById`, `createProperty`, `updateProperty`, `deleteProperty`, `toggleSaveProperty`, `getSavedProperties`, `getUserListings` |
| `message` | `{ conversations[], messages[], currentConversation, loading, error }` | `fetchConversations`, `createConversation`, `fetchMessages`, `sendMessage`, `archiveConversation` |
| `passwordReset` | `{ step: 'email'|'otp'|'password'|'success', email, loading, error, message }` | `sendOTP`, `verifyOTP`, `resetPassword` |
| `alert` | `{ alerts[{ id, type, message }] }` | `showAlert` (thunk with auto-removal timeout) |

### API Response Normalization
The frontend uses `extractResponseData()` in `services/api.ts` to handle two response shapes:
- **New format**: `{ success: true, data: ... }` → extracts `data`
- **Legacy format**: raw JSON object → passes through as-is

This is because some endpoints were migrated to the new `apiResponse.ts` helpers while others still return raw JSON for backward compatibility.

---

## 8. Authentication Flow

1. **Register**: Client sends `{ name, email, password }` → Server hashes password with bcrypt (10 rounds) → Creates user → Signs JWT with `{ id }` payload (7-day expiry) → Returns `{ token, user }`.
2. **Login**: Client sends `{ email, password }` → Server finds user → bcrypt compare → Signs JWT → Returns `{ token, user }`.
3. **Token Storage**: Frontend stores JWT in `localStorage` under key `token`.
4. **Request Auth**: Axios interceptor reads `localStorage.token` and sets `Authorization: Bearer <token>` header on every request.
5. **Route Protection**: Backend uses Passport.js JWT strategy (`passport-jwt`) — extracts token from `Authorization` header, verifies against `JWT_SECRET`, looks up user by decoded `id`.
6. **Password Reset**: OTP-based 3-step flow: `forgotPassword` (send OTP email) → `verifyOtp` (validate code) → `resetPassword` (set new password).

---

## 9. File Upload Architecture

| Upload Type | Storage | Size Limit | Allowed Types | Multer Config |
|---|---|---|---|---|
| **Avatars** | Local disk (`uploads/avatars/`) | 5 MB | jpeg, jpg, png, gif | `diskStorage` |
| **Property Images** | Cloudinary (via memory buffer) | 10 MB | jpeg, jpg, png, gif | `memoryStorage` → `uploadToCloudinary()` |
| **Message Attachments** | Local disk (`uploads/messages/`) | 10 MB | jpeg, jpg, png, gif, pdf, doc, docx | `diskStorage` with sanitized filenames |

Cloudinary uploads use eager transformation: `800x600 crop:fill` for property images.

---

## 10. Background Jobs

| Job | Trigger | Description |
|---|---|---|
| **Mark Expired Properties** | Server startup + every 24 hours | Sets `status = 'inactive'` for properties with `status = 'active'` and `createdAt` older than 30 days |
| **Activity Tracking** | Every authenticated request | Updates `user.lastActive` — debounced to at most once per 5 minutes per user (in-memory map) |
| **Memory Leak Prevention** | Every 10 minutes | Evicts stale entries from the activity debounce map |

---

## 11. Email Notifications

Configured via SMTP environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`). If not configured, emails are logged but not sent.

| Email | Trigger | Template |
|---|---|---|
| **Welcome** | After user registration | "Welcome to Flatmates!" with Browse Properties CTA |
| **OTP** | Password reset request | 6-digit code with 10-minute expiry note |
| **Password Reset** | Password reset via token | Reset link CTA |
| **New Message** | Message sent in conversation | "New message from {sender}" with View Message CTA |
| **Property Viewed** | Another user views your property | "Your property was viewed by {viewer}" |
| **Property Saved** | Another user saves your property | "Your property was saved by {user}" |

All user-provided values are HTML-escaped (`escapeHtml()`) to prevent XSS in email templates.

---

## 12. Caching Strategy

- **In-memory TTL cache** (`utils/cache.ts`) — `SimpleCache` with 500-entry cap and LRU eviction.
- Used for `GET /api/properties` responses (only for unauthenticated requests — authenticated requests compute personalized match scores).
- **Cache key**: serialized query parameters.
- **TTL**: 60 seconds.
- **Invalidation**: `cache.invalidatePrefix('properties:')` called when a property is created.
- **Designed for swap**: Implements `ICacheProvider` interface so Redis can be swapped in later.

---

## 13. Match Scoring Algorithm

Located in `utils/matchScore.ts`. Calculates compatibility (0–100) between a user's preferences and a property listing.

| Factor | Weight | Logic |
|---|---|---|
| **Budget** | 25 | Full score if listing ≤ user max budget. Partial (15pts) if within 20% over. |
| **Gender** | 25 | Full score if listing preference is "Any" or matches user gender. |
| **Lifestyle** | 30 | Ratio of matching lifestyle tags between user and listing. |
| **Room Type** | 20 | Full score if user's preferred room type matches property type. Partial (5pts) otherwise. |

Returns 100 if user has no preferences set (default — no filtering).

---

## 14. Frontend Routing

| Path | Component | Auth Required | Description |
|---|---|---|---|
| `/` | `Home` | No | Landing page |
| `/login` | `Login` | No | Login form |
| `/register` | `Register` | No | Registration form |
| `/forgot-password` | `ForgotPassword` | No | Password reset wizard |
| `/auth/success` | `AuthSuccess` | No | OAuth success callback |
| `/privacy` | `PrivacyPolicy` | No | Privacy policy page |
| `/properties` | `PropertyListing` | No | Browse all properties |
| `/properties/:id` | `PropertyDetails` | No | Single property detail |
| `/flats-in-:citySlug` | `CityLandingPage` | No | SEO city-specific landing page |
| `/services` | `ServiceMarketplace` | No | Services marketplace |
| `/roommates` | `Roommates` | No | Browse roommates |
| `/profile/:id` | `PublicProfile` | No | Public user profile |
| `/dashboard` | `Dashboard` | **Yes** | User dashboard |
| `/saved` | `SavedProperties` | **Yes** | Saved properties |
| `/onboarding` | `Onboarding` | **Yes** | Post-registration wizard |
| `/notifications` | `Notifications` | **Yes** | Notification center |
| `/profile` | `UserProfile` | **Yes** | Own profile |
| `/profile/edit` | `EditProfile` | **Yes** | Edit profile |
| `/messages/*` | `Messages` | **Yes** | Messaging system |
| `/properties/create` | `CreateProperty` | **Yes** | Create new listing |
| `/properties/my-listings` | `MyListings` | **Yes** | Manage own listings |
| `/properties/edit/:id` | `EditProperty` | **Yes** | Edit a listing |
| `*` | `NotFound` | No | 404 page |

---

## 15. Environment Variables

### Backend (`backend/.env`)
| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | `development` / `production` |
| `CLIENT_URL` | Frontend URL (for CORS + email links) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SMTP_HOST` | Email SMTP host |
| `SMTP_PORT` | Email SMTP port |
| `SMTP_USER` | Email SMTP username |
| `SMTP_PASS` | Email SMTP password |
| `SMTP_FROM` | Email "from" address |

### Frontend (`frontend/.env.local`)
| Variable | Purpose |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL (empty = proxy to localhost:5000) |

---

## 16. Deployment Topology

### Docker Compose (Production)
Three services on a single host:
1. **backend** — Node.js container on port 5000
2. **frontend** — React build served by Nginx on port 80 (internal)
3. **nginx-gateway** — Reverse proxy on ports 80/443, routes to frontend and backend, handles SSL via Let's Encrypt certificates

### Alternative Deployments
- **Vercel**: Frontend deployed via `vercel.json` config
- **Render**: Backend deployed via `render.yaml`
- **AWS EC2**: Manual deploy via `deploy_to_aws.ps1` PowerShell script

---

## 17. Coding Conventions & Patterns

1. **TypeScript throughout** — Both frontend and backend use TypeScript with strict-ish configs.
2. **API Response Shape**: New endpoints use `apiResponse.ts` helpers (`success()`, `error()`, `validationError()`) which wrap all responses in `{ success: boolean, data?, message?, errors? }`. Some legacy endpoints still return raw JSON for backward compatibility.
3. **Frontend Response Handling**: `extractResponseData()` normalizes both shapes — if `response.data.success !== undefined`, extracts `.data`; otherwise passes through raw.
4. **Form Data**: Complex objects (address, price, features, preferences) are JSON-stringified when sent via multipart/form-data and parsed back via `parseFormDataJSON()` on the server.
5. **Authentication**: JWT-based with Passport.js. Token stored in localStorage, sent via Axios interceptor as `Bearer` token.
6. **Async fire-and-forget**: Email notifications, response time tracking, and match notifications use `setImmediate()` to avoid blocking the request cycle.
7. **Soft deletes**: Conversations are archived (not deleted) via `isActive = false`.
8. **Validation**: Express-validator in route definitions with custom validators for nested FormData objects.
9. **Error Handling**: Global error middleware in `server.ts`. Controllers use try/catch with standardized error responses.
10. **Index Strategy**: MongoDB indexes are declared in model files, covering the most common query patterns (city+status+price, text search, owner lookups, featured listings).
11. **Lazy Loading**: All page components are lazy-loaded via `React.lazy()` + `Suspense` for code splitting.
12. **State Management**: Redux Toolkit with `createAsyncThunk` for all API calls. Socket events dispatch Redux actions directly.

---

## 18. Known Technical Debt & Gotchas

1. **Response shape inconsistency**: Some endpoints return raw JSON while others use the `{ success: true, data }` wrapper. The frontend's `extractResponseData()` handles both, but it's fragile.
2. **Roommate compatibility score is mocked**: `roommateController.ts` returns `Math.floor(Math.random() * 20) + 80` instead of a real algorithm.
3. **No real email/phone/ID verification**: `verifyUserAttribute` just flips boolean flags without actual verification flow.
4. **Avatars stored on disk**: Unlike property images (Cloudinary), avatars are stored on the local filesystem — will be lost on container restart unless the volume is persisted.
5. **No pagination on notifications**: Notifications are stored as an embedded array (capped at 100) — not a separate collection.
6. **Single-process cache**: The in-memory cache works for single-instance deployment but needs Redis for horizontal scaling.
7. **Password in login response payload**: The `getUser` endpoint correctly uses `.select('-password')`, but `loadUser` thunk returns the full user object from `authAPI.getMe()` — double-check the backend excludes password.
8. **PropertyForm.tsx is 42KB**: The largest file in the codebase and likely difficult to maintain — candidate for component extraction.
9. **`wrapHandler` type coercion**: The `wrapHandler` in `types/express.ts` uses `as unknown as RequestHandler` to suppress TypeScript errors — a pragmatic but imprecise workaround.

---

## 19. Testing Strategy

| Layer | Tool | Location | Notes |
|---|---|---|---|
| Unit Tests | Jest + ts-jest | `backend/src/**/*.test.ts`, `frontend/src/**/*.test.ts(x)` | Match score, notification service, Redux slices, components |
| E2E Tests | Playwright | `tests/*.spec.ts` | Mobile, roommates, scaling, trust & safety |
| Smoke Tests | Custom scripts | `backend/scripts/e2e-smoke.js` | HTTP-based API verification |
| Security Tests | Custom scripts | `backend/scripts/test-phase1-security.*` | Security audit scripts |

---

## 20. Quick Start for New Developers

```bash
# 1. Clone and install
git clone <repo>
cd Flatmates

# 2. Backend setup
cd backend
cp .env.example .env          # Configure MONGO_URI, JWT_SECRET, etc.
npm install
npm run dev                    # Starts on localhost:5000 with nodemon

# 3. Frontend setup (new terminal)
cd frontend
npm install
npm start                      # Starts on localhost:3000, proxies API to :5000

# 4. Seed data (optional)
cd backend
npx ts-node scripts/seedRoommates.ts
```

---

*This file was auto-generated by reviewing every source file in the repository. Last updated: July 2026.*
