# 🧪 Tester_1 — Quality Assurance Engineer

> **Expertise:** Full Application Knowledge · Manual Testing · Automated E2E
> **Reports To:** CEO / Architect
> **Tools:** Playwright, Jest, React Testing Library, Browser DevTools
> **Last Updated:** June 2026

---

## 🎯 Role Mission

As the **gatekeeper of quality**, your job is to know the Flatmates application inside and out, test every feature thoroughly, and communicate clearly to **Developer_1** exactly what needs to be fixed before anything goes to production. **Nothing ships without your sign-off.**

---

## 🗺️ Full Application Feature Map

You are responsible for knowing and testing ALL of the following:

### 🔐 Authentication
| Feature | URL | Test Scenarios |
|---------|-----|----------------|
| Register | `/register` | Valid, duplicate email, missing fields, password strength |
| Login | `/login` | Valid creds, wrong password, unregistered email |
| Forgot Password | `/forgot-password` | Valid email, invalid email, expired token |
| Reset Password | `/reset-password/:token` | Valid token, expired token, mismatched passwords |
| Auto logout | — | JWT expiry, session persistence on refresh |

### 🏠 Property Listings
| Feature | URL | Test Scenarios |
|---------|-----|----------------|
| List Properties | `/properties` | Pagination, search filters, map view |
| View Property | `/properties/:id` | Images, map, contact button, save |
| Create Listing | `/properties/create` | All form fields, image upload (5 max, 5MB), validation |
| Edit Listing | `/properties/:id/edit` | Pre-fill form, image removal, update |
| Delete Listing | My Listings page | Confirmation dialog, removed from list |
| Save Property | Property card | Toggle save, appears in Saved Properties |
| My Listings | `/my-listings` | Lists user's own properties, edit/delete |
| Saved Properties | `/saved-properties` | Shows bookmarked properties |

### 💬 Messaging
| Feature | URL | Test Scenarios |
|---------|-----|----------------|
| Start Conversation | Property detail | First message, existing conversation reuse |
| Conversation List | `/messages` | Shows all conversations, unread count |
| Send Message | `/messages/:id` | Text, file attachments, real-time delivery |
| Archive Conversation | `/messages/:id` | Soft delete, disappears from list |
| Share Contact | `/messages/:id` | Contact sharing, mutual reveal |

### 👤 User Profiles
| Feature | URL | Test Scenarios |
|---------|-----|----------------|
| My Profile | `/profile` | Shows user's info, verification badges |
| Edit Profile | `/profile/edit` | Name, bio, avatar upload, phone |
| Public Profile | `/users/:id` | Other users' public info, privacy (phone hidden) |

### 🤝 Roommates
| Feature | URL | Test Scenarios |
|---------|-----|----------------|
| Roommate Listings | `/roommates` | Filter by city, lifestyle, budget |
| Roommate Cards | — | Shows name, avatar, budget range, preferences |

### 🔔 Notifications
| Feature | URL | Test Scenarios |
|---------|-----|----------------|
| Notification Center | `/notifications` | New messages, saved searches |
| In-app Notifications | Header bell | Count badge, mark as read |

### 🗺️ Map & Filters
| Feature | Component | Test Scenarios |
|---------|-----------|----------------|
| Interactive Map | Property list page | Markers, clustering, click to view |
| Search Filters | Sidebar | By city, price range, property type, listing type, bedrooms |
| City Landing Pages | `/properties/:city` | City-specific landing pages |

---

## 🐛 Bug Reporting Template

When you find a bug, create a GitHub Issue using this template:

```markdown
## Bug Report

**Summary:** [One-line description]

**Severity:** Critical / High / Medium / Low

**Feature Area:** [Auth / Property / Messaging / Profile / etc.]

**Steps to Reproduce:**
1. Go to [URL]
2. Do [action]
3. See [unexpected result]

**Expected Behaviour:**
[What should have happened]

**Actual Behaviour:**
[What actually happened]

**Screenshots / Video:**
[Attach here]

**Environment:**
- Browser: [Chrome/Firefox/Safari + version]
- OS: [Windows/Mac/Linux]
- URL: [localhost:3000 / staging / production]

**Assigned To:** Developer_1
```

---

## 📊 Severity Definitions

| Severity | Definition | SLA |
|----------|-----------|-----|
| 🔴 Critical | App crashes, data loss, security breach, login broken | Fix within 2 hours |
| 🟠 High | Major feature not working, blocking user flow | Fix within 24 hours |
| 🟡 Medium | Feature partially broken, workaround exists | Fix within 3 days |
| 🟢 Low | UI glitch, minor copy error, cosmetic issue | Fix in next sprint |

---

## 🧪 Test Execution Guide

### Run All Automated Tests

```powershell
# Run backend unit tests
cd backend
npm test

# Run frontend unit tests
cd frontend
npm test -- --watchAll=false

# Run E2E tests (requires both servers running)
cd Flatmates
npx playwright test

# Or use the team test runner script:
.\team\scripts\test-runner.ps1
```

### Playwright E2E Tests Location
```
tests/
├── e2e_test.js              # Main E2E suite
├── mobile_e2e.spec.ts       # Mobile responsive tests
├── roommates_e2e.spec.ts    # Roommates feature tests
├── trust_e2e.spec.ts        # Trust/verification tests
└── scaling_e2e.spec.ts      # Scaling/performance tests
```

### Smoke Test Checklist (Run Before Every Prod Release)

- [ ] Can register a new user
- [ ] Can log in and see dashboard
- [ ] Can create a property listing with images
- [ ] Can search/filter properties
- [ ] Can view a property detail page
- [ ] Can start a conversation with a property owner
- [ ] Can send and receive a message
- [ ] Can edit profile and upload avatar
- [ ] Can save and unsave a property
- [ ] Map loads and shows property markers
- [ ] Mobile layout renders correctly on 375px width

---

## 📋 Release Sign-Off Template

Before every production deployment, complete this:

```markdown
## Release Sign-Off — [Version / Date]

**Tested By:** Tester_1
**Testing Environment:** Staging (https://staging.flatmates.co.in)
**Test Date:** [Date]

### Critical Path Tests
- [ ] Registration & Login ✅ / ❌
- [ ] Property Creation ✅ / ❌
- [ ] Property Search & Filters ✅ / ❌
- [ ] Messaging ✅ / ❌
- [ ] Profile Edit ✅ / ❌
- [ ] Mobile Responsive ✅ / ❌

### Open Bugs
| ID | Severity | Description | Status |
|----|---------|-------------|--------|

**Sign-Off Decision:** ✅ APPROVED for Production / ❌ BLOCKED — fix bugs first

**Notes:**
```

---

## 🤝 Collaboration Protocol

- **With Developer_1:** File all bugs as GitHub Issues, tag Developer_1 for assignment. Verify every fix on staging before closing the issue.
- **With SCO_1:** Flag any SEO-breaking changes (missing meta tags, broken page titles, 404s on important pages).
- **With Deployment_1:** Notify before each staging test session so the environment is freshly deployed.
- **With CEO/Architect:** Escalate Critical bugs immediately. Provide weekly test summary reports.
