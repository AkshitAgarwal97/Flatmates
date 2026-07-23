# 👨‍💻 Developer_1 — Full-Stack Engineer

> **Experience:** 10 Years Full-Stack Development
> **Reports To:** CEO / Architect
> **Stack:** React · TypeScript · Node.js · Express · MongoDB · Socket.IO
> **Last Updated:** June 2026

---

## 🎯 Role Mission

As the **sole Full-Stack Developer**, your goal is to build reliable, performant, and maintainable features for Flatmates. You are the engine of this startup — every feature ships through you.

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas connection string in `.env`)
- Docker Desktop (for nginx-gateway testing)

### Start the Stack

```powershell
# Backend
cd backend
npm install
npm run dev        # Starts on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm start          # Starts on http://localhost:3000
```

### Environment Setup

```bash
# Backend env
cp backend/.env.example backend/.env
# Fill in: MONGO_URI, JWT_SECRET, CLOUDINARY_*, SMTP_*

# Frontend env
cp frontend/.env.local.example frontend/.env.local
# Fill in: REACT_APP_API_URL=http://localhost:5000
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/         # Passport, Cloudinary config
│   ├── controllers/    # Route handler logic (if refactored)
│   ├── middleware/     # Auth, rate limiting, upload security
│   ├── models/         # Mongoose schemas (User, Property, Message...)
│   ├── routes/         # Express routers (auth, users, properties...)
│   ├── services/       # Socket.IO, email, notifications
│   ├── utils/          # Helper utilities
│   ├── validation/     # Express-validator schemas
│   └── server.ts       # App entry point
├── scripts/            # DB seed & utility scripts
├── uploads/            # Local file uploads (avatars, messages)
└── dist/               # Compiled TypeScript output

frontend/
├── src/
│   ├── components/     # Reusable UI components (layout, property, ui)
│   ├── pages/          # Route-level page components
│   ├── redux/          # Redux Toolkit slices + selectors + store
│   ├── services/       # Axios API service + Socket service
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Helper functions
│   ├── locales/        # i18n translation files
│   └── App.tsx         # Root app with router
```

---

## 🧑‍💻 Coding Standards

### TypeScript
- **Strict mode is ON** — no `any` unless absolutely necessary, document why with a comment
- Always define interface/type for request bodies, responses, and component props
- Use `useAppDispatch` and typed selectors — never use raw `useDispatch`

### React
- **Functional components only** — no class components
- `useEffect` dependencies must be complete — no eslint suppressions without a comment
- Extract complex logic into custom hooks (`usePropertyFilters`, `useSocket`, etc.)
- Component files: one component per file, PascalCase filenames

### Backend
- All routes must have authentication middleware where required
- Validate all inputs using `express-validator` before hitting controllers
- Use `async/await` — no `.then().catch()` chains in route handlers
- Log meaningful context: `console.error('[ROUTE] [ERROR_TYPE] message:', err)`

### Git Workflow
```bash
# Branch naming
feature/property-image-gallery
fix/message-unread-count-bug
chore/update-dependencies

# Commit format (Conventional Commits)
feat: add property image gallery with lightbox
fix: correct unread message count on conversation list
docs: update README with new backend structure
```

---

## 🔧 Common Backend Tasks

### Add a New API Route

1. Create a new router file in `backend/src/routes/myfeature.ts`
2. Import and mount it in `backend/src/server.ts`:
   ```typescript
   import myFeatureRoutes from './routes/myfeature';
   app.use('/api/myfeature', myFeatureRoutes);
   ```
3. Add Mongoose model if needed in `backend/src/models/`
4. Add input validation schema in `backend/src/validation/`

### Seed Test Data
```bash
cd backend
npx ts-node scripts/seedRoommates.ts
```

### Clean Old Messages
```bash
cd backend
npx ts-node scripts/cleanupMessages.ts
```

---

## 🔧 Common Frontend Tasks

### Add a New Page

1. Create `frontend/src/pages/mypage/MyPage.tsx`
2. Add a route in `frontend/src/App.tsx`:
   ```tsx
   <Route path="/mypage" element={<MyPage />} />
   ```
3. Add navigation link in `Layout.tsx` or `Header.tsx`
4. Export from the relevant `index.ts`

### Add a Redux Slice

1. Create `frontend/src/redux/slices/mySlice.ts` using `createSlice` and `createAsyncThunk`
2. Register it in `frontend/src/redux/store.ts`
3. Add selectors in `frontend/src/redux/selectors/`

---

## 🐛 Bug Fix Workflow

When **Tester_1** files a bug:

1. Read the bug report carefully — reproduce it locally first
2. Create a `fix/bug-name` branch
3. Fix the issue with minimal side effects
4. Write a comment in code explaining WHY if non-obvious
5. Test the fix locally (manual + any relevant unit tests)
6. Open a PR with a clear description referencing the bug issue
7. Tag Tester_1 to verify the fix on staging

---

## ✅ Pre-PR Checklist

- [ ] `npm run build` in `/backend` passes cleanly (zero TS errors)
- [ ] `npm run type-check` in `/frontend` passes cleanly
- [ ] Feature tested manually end-to-end locally
- [ ] No hardcoded secrets, API keys, or passwords in code
- [ ] Imports are clean — no unused imports
- [ ] Console logs removed (or replaced with proper logger)
- [ ] Tester_1 can reproduce and verify in staging
